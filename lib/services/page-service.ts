import type { PrismaClient } from "@/app/generated/prisma/client";

export class PageNotFoundError extends Error {
  constructor(message = "Page not found") {
    super(message);
    this.name = "PageNotFoundError";
  }
}

type CreatePageInput = {
  title: string;
  parentId?: string | null;
};

export async function createPage(db: PrismaClient, input: CreatePageInput) {
  return db.page.create({
    data: {
      title: input.title,
      parentId: input.parentId ?? null,
    },
  });
}

export async function findAll(db: PrismaClient) {
  return db.page.findMany({
    orderBy: { createdAt: "asc" },
  });
}

export async function findByIdWithBlocks(db: PrismaClient, id: string) {
  const page = await db.page.findUnique({
    where: { id },
    include: {
      blocks: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!page) {
    throw new PageNotFoundError();
  }

  return page;
}

export async function deletePage(db: PrismaClient, id: string) {
  const existing = await db.page.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new PageNotFoundError();
  }

  return db.page.delete({
    where: { id },
  });
}
