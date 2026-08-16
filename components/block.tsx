"use client";

import { createId } from "@paralleldrive/cuid2";
import { useEffect, useMemo, useRef } from "react";
import type { JSONContent } from "@tiptap/react";
import { EditorContent, Extension, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { Block as BlockModel } from "@/app/generated/prisma/browser";
import {
  findNextBlockByOrder,
  findPreviousBlockByOrder,
  focusEditorAtPos,
  isAtBlockStart,
  mergeDocs,
  mergePosAtEndOf,
  persistMergedBlocks,
} from "@/lib/editor/merge-block";
import {
  computeOrderBetween,
  focusEditorWhenRegistered,
  persistSplitBlocks,
  splitDocAtSelection,
} from "@/lib/editor/split-block";
import {
  AUTOSAVE_DEBOUNCE_MS,
  persistBlockContent,
} from "@/lib/editor/autosave-block";
import { usePageStore } from "@/lib/store/page-store";

type BlockProps = {
  block: Pick<
    BlockModel,
    | "id"
    | "content"
    | "type"
    | "pageId"
    | "order"
    | "parentBlockId"
    | "properties"
  >;
};

export function Block({ block }: BlockProps) {
  const registerEditor = usePageStore((state) => state.registerEditor);
  const unregisterEditor = usePageStore((state) => state.unregisterEditor);
  const insertBlock = usePageStore((state) => state.insertBlock);
  const deleteBlock = usePageStore((state) => state.deleteBlock);
  const initialContentRef = useRef(block.content);
  const blockRef = useRef(block);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  blockRef.current = block;

  const clearAutosaveTimerRef = useRef(() => {
    if (autosaveTimerRef.current !== null) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }
  });

  const scheduleAutosaveRef = useRef((content: JSONContent) => {
    clearAutosaveTimerRef.current();
    const blockId = blockRef.current.id;
    autosaveTimerRef.current = setTimeout(() => {
      autosaveTimerRef.current = null;
      persistBlockContent(blockId, content);
    }, AUTOSAVE_DEBOUNCE_MS);
  });

  const blockKeymap = useMemo(
    () =>
      Extension.create({
        name: "blockKeymap",
        addKeyboardShortcuts() {
          return {
            Enter: ({ editor }) => {
              const current = blockRef.current;
              const { before, after } = splitDocAtSelection(editor);
              const storeBlocks = usePageStore.getState().blocks;
              const index = storeBlocks.findIndex(
                (item) => item.id === current.id,
              );
              const currentOrder =
                index >= 0 ? storeBlocks[index].order : current.order;
              const nextOrder =
                index >= 0 ? storeBlocks[index + 1]?.order : undefined;
              const order = computeOrderBetween(currentOrder, nextOrder);
              const newBlockId = createId();

              clearAutosaveTimerRef.current();
              editor.commands.setContent(before, { emitUpdate: false });

              const newBlock: BlockModel = {
                id: newBlockId,
                pageId: current.pageId,
                parentBlockId: current.parentBlockId,
                type: "paragraph",
                content: after,
                order,
                properties: null,
              };

              insertBlock(current.id, newBlock);
              persistSplitBlocks({
                currentBlockId: current.id,
                before,
                newBlock,
              });
              focusEditorWhenRegistered(newBlockId);

              return true;
            },
            Backspace: ({ editor }) => {
              if (!isAtBlockStart(editor)) {
                return false;
              }

              const current = blockRef.current;
              const previous = findPreviousBlockByOrder(
                usePageStore.getState().blocks,
                current.id,
              );

              if (!previous) {
                return true;
              }

              const previousEditor = usePageStore
                .getState()
                .editorRegistry.get(previous.id);

              if (!previousEditor) {
                return true;
              }

              const mergePos = mergePosAtEndOf(previousEditor);
              const merged = mergeDocs(
                previousEditor.getJSON(),
                editor.getJSON(),
              );

              previousEditor.commands.setContent(merged, { emitUpdate: false });
              clearAutosaveTimerRef.current();
              deleteBlock(current.id);
              persistMergedBlocks({
                deletedBlockId: current.id,
                previousBlockId: previous.id,
                mergedContent: merged,
              });
              focusEditorAtPos(previous.id, mergePos);

              return true;
            },
            ArrowDown: ({ editor }) => {
              if (!editor.view.endOfTextblock("down")) {
                return false;
              }

              const next = findNextBlockByOrder(
                usePageStore.getState().blocks,
                blockRef.current.id,
              );

              if (!next) {
                return true;
              }

              const nextEditor = usePageStore
                .getState()
                .editorRegistry.get(next.id);

              if (!nextEditor) {
                return true;
              }

              nextEditor.commands.focus();
              return true;
            },
            ArrowUp: ({ editor }) => {
              if (!editor.view.endOfTextblock("up")) {
                return false;
              }

              const previous = findPreviousBlockByOrder(
                usePageStore.getState().blocks,
                blockRef.current.id,
              );

              if (!previous) {
                return true;
              }

              const previousEditor = usePageStore
                .getState()
                .editorRegistry.get(previous.id);

              if (!previousEditor) {
                return true;
              }

              previousEditor.commands.focus();
              return true;
            },
          };
        },
      }),
    [deleteBlock, insertBlock],
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bold: {},
        italic: {},
        code: {},
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        listKeymap: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
        hardBreak: false,
        strike: false,
        underline: false,
        link: false,
        dropcursor: false,
        gapcursor: false,
        undoRedo: false,
        trailingNode: false,
      }),
      blockKeymap,
    ],
    onUpdate: ({ editor: updatedEditor }) => {
      scheduleAutosaveRef.current(updatedEditor.getJSON());
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.commands.setContent(initialContentRef.current as JSONContent, {
      emitUpdate: false,
    });
  }, [editor]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    registerEditor(block.id, editor);

    return () => {
      clearAutosaveTimerRef.current();
      unregisterEditor(block.id);
    };
  }, [editor, block.id, registerEditor, unregisterEditor]);

  return (
    <EditorContent
      editor={editor}
      className="[&_.ProseMirror]:outline-none [&_.ProseMirror]:focus:outline-none"
    />
  );
}
