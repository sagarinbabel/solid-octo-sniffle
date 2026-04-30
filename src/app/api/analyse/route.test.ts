import { describe, expect, it, vi } from "vitest";
import { POST } from "./route";

vi.mock("openai", () => ({
  default: vi.fn(),
}));

describe("POST /api/analyse", () => {
  it("returns a safe missing-key error without calling OpenAI", async () => {
    const originalKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    const response = await POST(
      new Request("http://localhost/api/analyse", {
        method: "POST",
        body: JSON.stringify({
          requestText: "A defence customer needs a cautious internal triage response before any customer commitment.",
        }),
      }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Missing server-side API key. Add OPENAI_API_KEY to .env.local.",
    });

    process.env.OPENAI_API_KEY = originalKey;
  });
});
