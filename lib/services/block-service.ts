import type { Prisma, PrismaClient } from "@/app/generated/prisma/client";
import { NotFoundError } from "@/lib/errors";

export class BlockNotFoundError extends Error {
  constructor(message = "Block not found") {
    super(message);
    this.name = "BlockNotFoundError";
  }
}

type CreateBlockInput = {
  id?: string;
  pageId: string;
  type: string;
  content: Prisma.InputJsonValue;
  order: number;
  parentBlockId?: string | null;
};

type UpdateBlockInput = {
  content?: Prisma.InputJsonValue;
  type?: string;
  order?: number;
};

export async function createBlock(db: PrismaClient, input: CreateBlockInput) {
  return db.block.create({
    data: {
      ...(input.id !== undefined ? { id: input.id } : {}),
      pageId: input.pageId,
      type: input.type,
      content: input.content,
      order: input.order,
      parentBlockId: input.parentBlockId ?? null,
    },
  });
}

export async function updateBlock(
  db: PrismaClient,
  blockId: string,
  input: UpdateBlockInput,
) {
  const existing = await db.block.findUnique({
    where: { id: blockId },
  });

  if (!existing) {
    throw new NotFoundError("Block not found");
  }

  return db.block.update({
    where: { id: blockId },
    data: {
      ...(input.content !== undefined ? { content: input.content } : {}),
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.order !== undefined ? { order: input.order } : {}),
    },
  });
}

export async function deleteBlock(db: PrismaClient, id: string) {
  const existing = await db.block.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new BlockNotFoundError();
  }

  return db.block.delete({
    where: { id },
  });
}
