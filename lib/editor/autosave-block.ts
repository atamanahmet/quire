import type { JSONContent } from "@tiptap/react";

export const AUTOSAVE_DEBOUNCE_MS = 800;

export function persistBlockContent(blockId: string, content: JSONContent) {
  void fetch(`/api/blocks/${blockId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  }).catch((error: unknown) => {
    console.error(error);
  });
}
