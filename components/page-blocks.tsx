"use client";

import { useEffect } from "react";
import type { Block as BlockModel } from "@/app/generated/prisma/browser";
import { Block } from "@/components/block";
import { usePageStore } from "@/lib/store/page-store";

type PageBlocksProps = {
  blocks: BlockModel[];
};

export function PageBlocks({ blocks: initialBlocks }: PageBlocksProps) {
  const blocks = usePageStore((state) => state.blocks);
  const setBlocks = usePageStore((state) => state.setBlocks);

  useEffect(() => {
    setBlocks(initialBlocks);
  }, [initialBlocks, setBlocks]);

  return (
    <div className="flex flex-col gap-2">
      {blocks.map((block) => (
        <Block
          key={block.id}
          block={{
            id: block.id,
            content: block.content,
            type: block.type,
            pageId: block.pageId,
            order: block.order,
            parentBlockId: block.parentBlockId,
            properties: block.properties,
          }}
        />
      ))}
    </div>
  );
}
