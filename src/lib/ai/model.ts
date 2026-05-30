// Resolve which model/provider to use from the environment. Prefers a real Vercel AI
// Gateway key (vck_…); falls back to a direct Anthropic key (ANTHROPIC_API_KEY, or one
// mistakenly placed in AI_GATEWAY_API_KEY). Returns null when nothing usable is set.

import { createAnthropic } from "@ai-sdk/anthropic";
import type { LanguageModel } from "ai";

export interface ResolvedModel {
  model: LanguageModel;
  provider: "gateway" | "anthropic";
}

const GATEWAY_DEFAULT = "anthropic/claude-sonnet-4.6";
const ANTHROPIC_DEFAULT = "claude-sonnet-4-5";

type Env = Record<string, string | undefined>;

export function resolveModel(env: Env = process.env): ResolvedModel | null {
  const gw = env.AI_GATEWAY_API_KEY?.trim();
  const anthropicKey =
    env.ANTHROPIC_API_KEY?.trim() ||
    (gw && gw.startsWith("sk-ant-") ? gw : undefined);

  // A genuine gateway key (anything set that isn't an Anthropic key) → use the gateway.
  if (gw && !gw.startsWith("sk-ant-")) {
    return { provider: "gateway", model: env.AI_MODEL || GATEWAY_DEFAULT };
  }
  // Otherwise, a direct Anthropic key.
  if (anthropicKey) {
    // Pin the base URL so a stray/incomplete ANTHROPIC_BASE_URL in the ambient
    // environment (e.g. ".../anthropic.com" without "/v1") can't break requests.
    const anthropic = createAnthropic({
      apiKey: anthropicKey,
      baseURL: "https://api.anthropic.com/v1",
    });
    return {
      provider: "anthropic",
      model: anthropic(env.ANTHROPIC_MODEL || ANTHROPIC_DEFAULT),
    };
  }
  return null;
}
