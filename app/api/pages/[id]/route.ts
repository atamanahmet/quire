import { jsonData, jsonError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import {
  deletePage,
  findByIdWithBlocks,
  PageNotFoundError,
} from "@/lib/services/page-service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const page = await findByIdWithBlocks(prisma, id);
    return jsonData(page);
  } catch (error) {
    if (error instanceof PageNotFoundError) {
      return jsonError(error.message, 404, "NOT_FOUND");
    }

    console.error(error);
    return jsonError("Failed to fetch page", 500, "INTERNAL_ERROR");
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const page = await deletePage(prisma, id);
    return jsonData({ id: page.id });
  } catch (error) {
    if (error instanceof PageNotFoundError) {
      return jsonError(error.message, 404, "NOT_FOUND");
    }

    console.error(error);
    return jsonError("Failed to delete page", 500, "INTERNAL_ERROR");
  }
}
