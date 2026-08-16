import { z } from "zod";

export const createPageSchema = z.object({
  title: z.string().min(1),
  parentId: z.string().optional().nullable(),
});
