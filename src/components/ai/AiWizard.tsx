"use client";

import { useMemo, useRef, useState } from "react";
import { sanitizeAiHtml } from "@/lib/ai/sanitizeAi";
import { stripCodeFences } from "@/lib/ai/prompt";
import { downloadHtml } from "@/lib/download";
import LivePreview from "../wizard/LivePreview";
import ContentInput from "./ContentInput";
import { StepLabel, StepTitle } from "../wizard/ui";

export default function AiWizard() {
  const [content, setContent] = useState("");
  const [brief, setBrief] = useState("");
  const [html, setHtml] = useState("");
  const [refine, setRefine] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "streaming">("idle");
  const [error, setError] = useState<string | null>(null);
  const [needsKey, setNeedsKey] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const fileBytes = useMemo(
    () => (html ? new Blob([html]).size : 0),
    [html],
  );

  async function run(payload: Record<string, unknown>, instruction?: string) {
    setError(null);
    setNeedsKey(false);
    setStatus("streaming");
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({ error: `Error ${res.status}` }));
        if (res.status === 503) setNeedsKey(true);
        throw new Error(data.error ?? "Generation failed.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setHtml(sanitizeAiHtml(stripCodeFences(acc)));
      }
      if (instruction) setLog((l) => [...l, instruction]);
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError((e as Error).message);
    } finally {
      setStatus("idle");
    }
  }

  const generate = () => run({ content, brief });
  const applyRefine = () => {
    const instruction = refine.trim();
    if (!instruction || !html) return;
    setRefine("");
    run({ content, brief, previousHtml: html, instruction }, instruction);
  };

  const busy = status === "streaming";
  const hasContent = content.trim().length > 0;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,440px)_1fr]">
      <div className="flex flex-col gap-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div>
          <StepLabel>AI design</StepLabel>
          <StepTitle>Content</StepTitle>
          <ContentInput value={content} onChange={setContent} />
        </div>

        <div>
          <p className="mb-1 text-sm font-medium text-zinc-700">Style brief</p>
          <input
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="e.g. warm editorial, big hero, serif headings"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <button
          type="button"
          onClick={generate}
          disabled={!hasContent || busy}
          className="rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:opacity-40"
        >
          {busy ? "Designing…" : html ? "Regenerate" : "✨ Generate design"}
        </button>

        {needsKey && (
          <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            AI design needs a key. Set <code>AI_GATEWAY_API_KEY</code> (Vercel AI
            Gateway, <code>vck_…</code>) or <code>ANTHROPIC_API_KEY</code> (direct
            Anthropic, <code>sk-ant-…</code>) in <code>.env.local</code> and on Vercel,
            then restart.
          </div>
        )}
        {error && !needsKey && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
        )}

        {html && (
          <div className="border-t border-zinc-100 pt-4">
            <p className="mb-1 text-sm font-medium text-zinc-700">Refine</p>
            <div className="flex gap-2">
              <input
                value={refine}
                onChange={(e) => setRefine(e.target.value)}
                placeholder="make it warmer, full-bleed hero…"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !busy) applyRefine();
                }}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
              <button
                type="button"
                onClick={applyRefine}
                disabled={!refine.trim() || busy}
                className="shrink-0 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-40"
              >
                Apply
              </button>
            </div>
            {log.length > 0 && (
              <ul className="mt-3 space-y-1 text-xs text-zinc-500">
                {log.map((l, i) => (
                  <li key={i}>✓ {l}</li>
                ))}
              </ul>
            )}
            <button
              type="button"
              onClick={() => downloadHtml(html, brief || "ai-page")}
              disabled={busy}
              className="mt-4 w-full rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-40"
            >
              ⤓ Download .html
            </button>
            <p className="mt-2 text-center text-xs text-zinc-400">
              AI pages use external fonts/images — they need internet to render.
            </p>
          </div>
        )}
      </div>

      <div className="min-h-[560px]">
        <LivePreview
          doc={html}
          hasContent={Boolean(html)}
          title={brief || "ai-page"}
          fileBytes={fileBytes}
          sandbox=""
          emptyHint="Add content, write a style brief, and hit Generate — your bespoke page streams in here."
        />
      </div>
    </div>
  );
}
