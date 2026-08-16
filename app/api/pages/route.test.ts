import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/pages/route";

describe("POST /api/pages", () => {
  it("returns 201 with a data envelope for a valid title", async () => {
    const request = new Request("http://localhost/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Vitest Integration Page" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual({
      data: expect.objectContaining({
        id: expect.any(String),
        title: "Vitest Integration Page",
        parentId: null,
      }),
    });
  });
});
