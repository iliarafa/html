import { describe, it, expect } from "vitest";
import { resolveModel } from "./model";

describe("resolveModel", () => {
  it("uses the gateway when a vck_ key is set", () => {
    const r = resolveModel({ AI_GATEWAY_API_KEY: "vck_abc" });
    expect(r?.provider).toBe("gateway");
    expect(r?.model).toBe("anthropic/claude-sonnet-4.6");
  });

  it("honors AI_MODEL for the gateway", () => {
    const r = resolveModel({
      AI_GATEWAY_API_KEY: "vck_abc",
      AI_MODEL: "openai/gpt-5",
    });
    expect(r?.model).toBe("openai/gpt-5");
  });

  it("falls back to a direct Anthropic key in ANTHROPIC_API_KEY", () => {
    const r = resolveModel({ ANTHROPIC_API_KEY: "sk-ant-123" });
    expect(r?.provider).toBe("anthropic");
    expect(r?.model).toBeTruthy();
  });

  it("recovers an Anthropic key mistakenly placed in AI_GATEWAY_API_KEY", () => {
    const r = resolveModel({ AI_GATEWAY_API_KEY: "sk-ant-xyz" });
    expect(r?.provider).toBe("anthropic");
  });

  it("returns null when nothing usable is set", () => {
    expect(resolveModel({})).toBeNull();
  });
});
