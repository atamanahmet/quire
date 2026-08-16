import type { Editor, JSONContent } from "@tiptap/react";
import { TextSelection } from "@tiptap/pm/state";
import type { Block } from "@/app/generated/prisma/browser";
import { usePageStore } from "@/lib/store/page-store";

const EMPTY_DOC: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export function isAtBlockStart(editor: Editor): boolean {
  const { selection } = editor.state;
  if (!selection.empty) {
    return false;
  }

  const start = TextSelection.atStart(editor.state.doc).from;
  return selection.from === start;
}

export function findPreviousBlockByOrder(
  blocks: Block[],
  currentId: string,
): Block | null {
  const current = blocks.find((block) => block.id === currentId);
  if (!current) {
    return null;
  }

  let previous: Block | null = null;

  for (const block of blocks) {
    if (block.order >= current.order) {
      continue;
    }

    if (!previous || block.order > previous.order) {
      previous = block;
    }
  }

  return previous;
}

export function findNextBlockByOrder(
  blocks: Block[],
  currentId: string,
): Block | null {
  const current = blocks.find((block) => block.id === currentId);
  if (!current) {
    return null;
  }

  let next: Block | null = null;

  for (const block of blocks) {
    if (block.order <= current.order) {
      continue;
    }

    if (!next || block.order < next.order) {
      next = block;
    }
  }

  return next;
}

export function mergeDocs(
  previous: JSONContent,
  current: JSONContent,
): JSONContent {
  const previousNodes = [...(previous.content ?? [])];
  const currentNodes = [...(current.content ?? [])];

  if (previousNodes.length === 0) {
    return normalizeDocJson(current);
  }

  if (currentNodes.length === 0) {
    return normalizeDocJson(previous);
  }

  const lastPrevious = previousNodes[previousNodes.length - 1];
  const firstCurrent = currentNodes[0];

  if (
    lastPrevious?.type === "paragraph" &&
    firstCurrent?.type === "paragraph"
  ) {
    return {
      type: "doc",
      content: [
        ...previousNodes.slice(0, -1),
        {
          ...lastPrevious,
          content: [
            ...(lastPrevious.content ?? []),
            ...(firstCurrent.content ?? []),
          ],
        },
        ...currentNodes.slice(1),
      ],
    };
  }

  return {
    type: "doc",
    content: [...previousNodes, ...currentNodes],
  };
}

function normalizeDocJson(doc: JSONContent): JSONContent {
  if (!doc.content || doc.content.length === 0) {
    return EMPTY_DOC;
  }

  return doc;
}

export function mergePosAtEndOf(editor: Editor): number {
  return TextSelection.atEnd(editor.state.doc).from;
}

export function focusEditorAtPos(blockId: string, pos: number) {
  const tryFocus = (editor: Editor | undefined) => {
    if (!editor) {
      return false;
    }

    editor.commands.setTextSelection(pos);
    editor.commands.focus();
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
    editor.commands.setTextSelection(pos);
    editor.commands.focus();
  });
}

export function persistMergedBlocks(input: {
  deletedBlockId: string;
  previousBlockId: string;
  mergedContent: JSONContent;
}) {
  void fetch(`/api/blocks/${input.deletedBlockId}`, {
    method: "DELETE",
  }).catch((error: unknown) => {
    console.error(error);
  });

  void fetch(`/api/blocks/${input.previousBlockId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: input.mergedContent }),
  }).catch((error: unknown) => {
    console.error(error);
  });
}
