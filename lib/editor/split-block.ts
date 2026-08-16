import type { Editor, JSONContent } from "@tiptap/react";
import type { Block } from "@/app/generated/prisma/browser";
import { usePageStore } from "@/lib/store/page-store";

const EMPTY_DOC: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export function splitDocAtSelection(editor: Editor): {
  before: JSONContent;
  after: JSONContent;
} {
  const { from, to } = editor.state.selection;
  const doc = editor.state.doc;
  const beforeNode = doc.cut(0, from);
  const afterNode = doc.cut(to, doc.content.size);

  return {
    before: normalizeDocJson(beforeNode.toJSON() as JSONContent),
    after: normalizeDocJson(afterNode.toJSON() as JSONContent),
  };
}

function normalizeDocJson(doc: JSONContent): JSONContent {
  if (!doc.content || doc.content.length === 0) {
    return EMPTY_DOC;
  }

  return doc;
}

export function computeOrderBetween(
  currentOrder: number,
  nextOrder: number | undefined,
): number {
  if (nextOrder === undefined) {
    return currentOrder + 1;
  }

  return (currentOrder + nextOrder) / 2;
}

export function focusEditorWhenRegistered(blockId: string) {
  const tryFocus = (editor: Editor | undefined) => {
    if (!editor) {
      return false;
    }

    editor.commands.focus("start");
    return true;
  };

  if (tryFocus(usePageStore.getState().editorRegistry.get(blockId))) {
    return;
  }

  const unsubscribe = usePageStore.subscribe((state) => {
    const editor = state.editorRegistry.get(blockId);
    if (!editor) {
      return;
    }

    unsubscribe();
    editor.commands.focus("start");
  });
}

export function persistSplitBlocks(input: {
  currentBlockId: string;
  before: JSONContent;
  newBlock: Block;
}) {
  void fetch(`/api/blocks/${input.currentBlockId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: input.before }),
  }).catch((error: unknown) => {
    console.error(error);
  });

  void fetch("/api/blocks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: input.newBlock.id,
      pageId: input.newBlock.pageId,
      type: input.newBlock.type,
      content: input.newBlock.content,
      order: input.newBlock.order,
      parentBlockId: input.newBlock.parentBlockId,
    }),
  }).catch((error: unknown) => {
    console.error(error);
  });
}
