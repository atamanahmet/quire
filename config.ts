import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
});

export const config = envSchema.parse(process.env);
