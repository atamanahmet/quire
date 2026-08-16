import { z } from "zod";
import type { Prisma } from "@/app/generated/prisma/client";
import { jsonData, jsonError } from "@/lib/api-response";
import { NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import {
  BlockNotFoundError,
  deleteBlock,
  updateBlock,
} from "@/lib/services/block-service";

const updateBlockSchema = z
  .object({
    content: z.unknown().optional(),
    type: z.string().min(1).optional(),
    order: z.number().optional(),
  })
  .refine(
    (value) =>
      value.content !== undefined ||
      value.type !== undefined ||
      value.order !== undefined,
    { message: "At least one field is required" },
  );

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400, "INVALID_JSON");
  }

  const parsed = updateBlockSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Invalid request body", 400, "VALIDATION_ERROR");
  }

  try {
    const block = await updateBlock(prisma, id, {
      content:
        parsed.data.content !== undefined
          ? (parsed.data.content as Prisma.InputJsonValue)
          : undefined,
      type: parsed.data.type,
      order: parsed.data.order,
    });
    return jsonData(block);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return jsonError(error.message, 404, error.code);
    }

    console.error(error);
    return jsonError("Failed to update block", 500, "INTERNAL_ERROR");
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const block = await deleteBlock(prisma, id);
    return jsonData({ id: block.id });
  } catch (error) {
    if (error instanceof BlockNotFoundError) {
      return jsonError(error.message, 404, "NOT_FOUND");
    }

    console.error(error);
    return jsonError("Failed to delete block", 500, "INTERNAL_ERROR");
  }
}
