import { jsonData, jsonError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { createPage } from "@/lib/services/page-service";
import { createPageSchema } from "@/app/api/pages/create-page-schema";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400, "INVALID_JSON");
  }

  const parsed = createPageSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Invalid request body", 400, "VALIDATION_ERROR");
  }

  try {
    const page = await createPage(prisma, parsed.data);
    return jsonData(page, 201);
  } catch (error) {
    console.error(error);
    return jsonError("Failed to create page", 500, "INTERNAL_ERROR");
  }
}
