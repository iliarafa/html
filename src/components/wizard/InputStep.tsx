"use client";

import { useState } from "react";
import { render } from "@/lib/parser";
import type { InputType } from "@/lib/types";
import type { SourceMode, WizardState } from "./state";
import { Field, SegMode, StepLabel, StepTitle, TextInput } from "./ui";

export default function InputStep({
  state,
  update,
  seed,
  goNext,
}: {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
  /** Replace the editor content with rendered HTML. */
  seed: (html: string) => void;
  goNext: () => void;
}) {
  const [mode, setMode] = useState<SourceMode>("paste");
  const [pasteType, setPasteType] = useState<InputType>("markdown");
  const [pasteText, setPasteText] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  function loadPaste() {
    if (!pasteText.trim()) return;
    seed(render(pasteText, pasteType));
    goNext();
  }

  async function readFile(file: File) {
    const text = await file.text();
    const isMd = /\.md$|\.markdown$/i.test(file.name);
    seed(render(text, isMd ? "markdown" : "text"));
    if (!state.title) update({ title: file.name.replace(/\.[^.]+$/, "") });
    goNext();
  }

  async function scrape() {
    setError(null);
    setOk(null);
    setLoading(true);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Couldn't scrape that link.");
      seed(render(data.html, "html"));
      update({
        title: state.title || data.title || "",
        author: state.author || data.author || "",
      });
      setOk(`Imported readable text${data.html.includes("data:image") ? " + images" : ""}. Continue to Edit →`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <StepLabel>Step 1</StepLabel>
      <StepTitle>Add your content</StepTitle>

      <div className="mb-4">
        <SegMode
          value={mode}
          onChange={(v) => setMode(v as SourceMode)}
          options={[
            { value: "paste", label: "Paste" },
            { value: "upload", label: "Upload" },
            { value: "link", label: "Link" },
          ]}
        />
      </div>

      {mode === "paste" && (
        <>
          <div className="mb-3">
            <SegMode
              value={pasteType}
              onChange={(v) => setPasteType(v as InputType)}
              options={[
                { value: "markdown", label: "Markdown" },
                { value: "text", label: "Plain text" },
              ]}
            />
          </div>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={pasteType === "text" ? "Paste your notes…" : "# Heading\n\nWrite **Markdown** here…"}
            className="h-56 w-full resize-y rounded-lg border border-zinc-300 bg-white p-3 font-mono text-sm text-zinc-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
          <button
            type="button"
            onClick={loadPaste}
            disabled={!pasteText.trim()}
            className="mt-3 w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:opacity-40"
          >
            Load into editor →
          </button>
          <p className="mt-2 text-center text-xs text-zinc-400">
            Or skip — you can type directly in the next step.
          </p>
        </>
      )}

      {mode === "upload" && (
        <label className="flex h-56 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-white text-center transition hover:border-emerald-400 hover:bg-emerald-50/30">
          <input
            type="file"
            accept=".md,.markdown,.txt,text/plain,text/markdown"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) readFile(f);
            }}
          />
          <span className="text-3xl text-zinc-300">⤓</span>
          <span className="mt-2 text-sm font-medium text-zinc-700">Choose a .md or .txt file</span>
          <span className="mt-1 text-xs text-zinc-400">Markdown is rendered; plain text is preserved</span>
        </label>
      )}

      {mode === "link" && (
        <div>
          <Field label="Article URL" hint="We fetch the page, extract the readable text, and embed its images.">
            <div className="flex gap-2">
              <TextInput
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/article"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && url && !loading) scrape();
                }}
              />
              <button
                type="button"
                onClick={scrape}
                disabled={!url || loading}
                className="shrink-0 rounded-lg bg-emerald-500 px-4 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:opacity-40"
              >
                {loading ? "Fetching…" : "Fetch"}
              </button>
            </div>
          </Field>
          {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}
          {ok && !error && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{ok}</p>}
        </div>
      )}
    </div>
  );
}
