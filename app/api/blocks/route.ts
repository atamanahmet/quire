import { z } from "zod";
import type { Prisma } from "@/app/generated/prisma/client";
import { jsonData, jsonError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { createBlock } from "@/lib/services/block-service";

const EMPTY_TIPTAP_DOC = { type: "doc", content: [] } as const;

const createBlockSchema = z.object({
  id: z.string().min(1).optional(),
  pageId: z.string().min(1),
  type: z.string().min(1),
  content: z.unknown().optional(),
  order: z.number(),
  parentBlockId: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400, "INVALID_JSON");
  }

  const parsed = createBlockSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Invalid request body", 400, "VALIDATION_ERROR");
  }

  try {
    const block = await createBlock(prisma, {
      id: parsed.data.id,
      pageId: parsed.data.pageId,
      type: parsed.data.type,
      content: (parsed.data.content ?? EMPTY_TIPTAP_DOC) as Prisma.InputJsonValue,
      order: parsed.data.order,
      parentBlockId: parsed.data.parentBlockId,
    });
    return jsonData(block, 201);
  } catch (error) {
    console.error(error);
    return jsonError("Failed to create block", 500, "INTERNAL_ERROR");
  }
}
