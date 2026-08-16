import type { Prisma, PrismaClient } from "@/app/generated/prisma/client";
import { NotFoundError } from "@/lib/errors";

type UpdateBlockInput = {
  content?: Prisma.InputJsonValue;
  type?: string;
  order?: number;
};

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
