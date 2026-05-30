// AI design route: stream a complete HTML+CSS page from content + a style brief, or
// refine an existing page from an instruction. Uses the AI SDK — a Vercel AI Gateway
// "provider/model" string when a gateway key is set, or a direct Anthropic key. Errors
// during the first token (auth/config) are caught and returned as JSON so the client
// shows a real message instead of a silent empty response.

import { streamText } from "ai";
import { resolveModel } from "@/lib/ai/model";
import {
  buildPrompt,
  MAX_CONTENT_CHARS,
  MAX_INSTRUCTION_CHARS,
} from "@/lib/ai/prompt";

export const runtime = "nodejs";
export const maxDuration = 120;

function bad(error: string, status: number) {
  return Response.json({ error }, { status });
}

function friendlyAiError(e: unknown): string {
  const msg = (e as Error)?.message ?? "Generation failed.";
  if (/AI Gateway|gateway/i.test(msg) && /authenticat/i.test(msg)) {
    return "The AI Gateway rejected the key. Use a Vercel AI Gateway key (vck_…), or set ANTHROPIC_API_KEY to use an Anthropic key directly.";
  }
  if (/api[-_ ]?key|authenticat|unauthor|401|invalid x-api-key/i.test(msg)) {
    return "The API key was rejected. Double-check the key and that it has access to the model.";
  }
  if (/model|not found|404/i.test(msg)) {
    return "The configured model isn't available for this key. Try a different AI_MODEL / ANTHROPIC_MODEL.";
  }
  return msg;
}

export async function POST(req: Request) {
  const resolved = resolveModel();
  if (!resolved) {
    return bad(
      "AI design isn't configured. Set AI_GATEWAY_API_KEY (Vercel AI Gateway) or ANTHROPIC_API_KEY (direct Anthropic key).",
      503,
    );
  }

  let body: {
    content?: string;
    brief?: string;
    previousHtml?: string;
    instruction?: string;
  };
  try {
    body = await req.json();
  } catch {
    return bad("Invalid request body.", 400);
  }

  const content = (body.content ?? "").slice(0, MAX_CONTENT_CHARS);
  const instruction = (body.instruction ?? "").slice(0, MAX_INSTRUCTION_CHARS);
  const isRefine = Boolean(body.previousHtml && instruction);
  if (!isRefine && !content.trim()) {
    return bad("Add some content first.", 400);
  }

  const { system, prompt } = buildPrompt({
    content,
    brief: body.brief,
    previousHtml: body.previousHtml,
    instruction,
  });

  // The AI SDK routes stream errors to onError instead of throwing through the
  // iterator, so capture them here to surface a real message to the client.
  let captured: unknown = null;
  const result = streamText({
    model: resolved.model,
    system,
    prompt,
    maxOutputTokens: 16_000,
    temperature: 0.7,
    onError: ({ error }) => {
      captured = error;
    },
  });

  // Pull the first chunk eagerly so auth/config errors become a clean JSON 502
  // instead of an opaque empty 200 stream.
  const iterator = result.textStream[Symbol.asyncIterator]();
  let first: IteratorResult<string>;
  try {
    first = await iterator.next();
  } catch (e) {
    return bad(friendlyAiError(e), 502);
  }
  if (first.done) {
    return bad(friendlyAiError(captured ?? new Error("The model returned an empty response.")), 502);
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      if (!first.done && first.value) controller.enqueue(encoder.encode(first.value));
    },
    async pull(controller) {
      try {
        const { done, value } = await iterator.next();
        if (done) {
          controller.close();
          return;
        }
        if (value) controller.enqueue(encoder.encode(value));
      } catch (e) {
        controller.error(e);
      }
    },
  });

  return new Response(stream, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
