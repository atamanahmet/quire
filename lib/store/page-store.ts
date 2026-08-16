"use client";

import type { Editor } from "@tiptap/react";
import { create } from "zustand";
import type { Block } from "@/app/generated/prisma/browser";

interface PageStore {
  blocks: Block[];
  editorRegistry: Map<string, Editor>;

  setBlocks: (blocks: Block[]) => void;
  insertBlock: (afterId: string, block: Block) => void;
  deleteBlock: (id: string) => void;
  registerEditor: (id: string, editor: Editor) => void;
  unregisterEditor: (id: string) => void;
}

export const usePageStore = create<PageStore>((set) => ({
  blocks: [],
  editorRegistry: new Map(),

  setBlocks: (blocks) =>
    set({
      blocks: [...blocks].sort((a, b) => a.order - b.order),
    }),

  insertBlock: (afterId, block) =>
    set((state) => {
      const index = state.blocks.findIndex((item) => item.id === afterId);
      if (index === -1) {
        return { blocks: [...state.blocks, block] };
      }

      const blocks = [...state.blocks];
      blocks.splice(index + 1, 0, block);
      return { blocks };
    }),

  deleteBlock: (id) =>
    set((state) => ({
      blocks: state.blocks.filter((block) => block.id !== id),
    })),

  registerEditor: (id, editor) =>
    set((state) => {
      const editorRegistry = new Map(state.editorRegistry);
      editorRegistry.set(id, editor);
      return { editorRegistry };
    }),

  unregisterEditor: (id) =>
    set((state) => {
      const editorRegistry = new Map(state.editorRegistry);
      editorRegistry.delete(id);
      return { editorRegistry };
    }),
}));
