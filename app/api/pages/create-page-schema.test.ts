import { describe, expect, it } from "vitest";
import { createPageSchema } from "@/app/api/pages/create-page-schema";

describe("createPageSchema", () => {
  it("rejects an empty title", () => {
    const result = createPageSchema.safeParse({ title: "" });

    expect(result.success).toBe(false);
  });
});
