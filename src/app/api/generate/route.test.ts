import { describe, it, expect, afterEach } from "vitest";
import { POST } from "./route";

function post(body: unknown) {
  return POST(new Request("http://localhost/api/generate", {
    method: "POST",
    body: JSON.stringify(body),
  }));
}

describe("/api/generate", () => {
  afterEach(() => {
    delete process.env.AI_GATEWAY_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
  });

  it("returns 503 with a friendly message when no key is configured", async () => {
    delete process.env.AI_GATEWAY_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    const res = await post({ content: "hello", brief: "modern" });
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.error).toMatch(/AI_GATEWAY_API_KEY|ANTHROPIC_API_KEY/);
  });

  it("returns 400 when content is missing (and not a refine)", async () => {
    process.env.AI_GATEWAY_API_KEY = "vck_test";
    const res = await post({ content: "   ", brief: "modern" });
    expect(res.status).toBe(400);
  });
});
