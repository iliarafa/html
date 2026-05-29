"use client";

import { useState } from "react";
import type { WizardState } from "./state";
import { Field, SegMode, StepLabel, StepTitle, TextInput } from "./ui";

export default function InputStep({
  state,
  update,
}: {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
}) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrapedFrom, setScrapedFrom] = useState<string | null>(null);

  async function readFile(file: File) {
    const text = await file.text();
    const isMd = /\.md$|\.markdown$/i.test(file.name);
    update({
      rawInput: text,
      inputType: isMd ? "markdown" : "text",
      title: state.title || file.name.replace(/\.[^.]+$/, ""),
    });
  }

  async function scrape() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Couldn't scrape that link.");
      update({
        rawInput: data.html,
        inputType: "html",
        title: state.title || data.title || "",
        author: state.author || data.author || "",
      });
      setScrapedFrom(url);
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
          value={state.sourceMode}
          onChange={(v) =>
            update({ sourceMode: v as WizardState["sourceMode"] })
          }
          options={[
            { value: "paste", label: "Paste" },
            { value: "upload", label: "Upload" },
            { value: "link", label: "Link" },
          ]}
        />
      </div>

      {state.sourceMode === "paste" && (
        <>
          <div className="mb-3">
            <SegMode
              value={state.inputType === "text" ? "text" : "markdown"}
              onChange={(v) => update({ inputType: v as "markdown" | "text" })}
              options={[
                { value: "markdown", label: "Markdown" },
                { value: "text", label: "Plain text" },
              ]}
            />
          </div>
          <textarea
            value={state.inputType === "html" ? "" : state.rawInput}
            onChange={(e) => update({ rawInput: e.target.value })}
            placeholder={
              state.inputType === "text"
                ? "Paste your notes…"
                : "# Heading\n\nWrite **Markdown** here…"
            }
            className="h-72 w-full resize-y rounded-lg border border-zinc-300 bg-white p-3 font-mono text-sm text-zinc-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </>
      )}

      {state.sourceMode === "upload" && (
        <label className="flex h-72 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-white text-center transition hover:border-indigo-400 hover:bg-indigo-50/30">
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
          <span className="mt-2 text-sm font-medium text-zinc-700">
            Click to choose a .md or .txt file
          </span>
          <span className="mt-1 text-xs text-zinc-400">
            {state.rawInput && state.inputType !== "html"
              ? "Loaded ✓ — choose another to replace"
              : "Markdown is rendered; plain text is preserved"}
          </span>
        </label>
      )}

      {state.sourceMode === "link" && (
        <div>
          <Field
            label="Article URL"
            hint="We fetch the page and extract the readable text (images stripped)."
          >
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
                className="shrink-0 rounded-lg bg-indigo-500 px-4 text-sm font-medium text-white transition hover:bg-indigo-600 disabled:opacity-40"
              >
                {loading ? "Fetching…" : "Fetch"}
              </button>
            </div>
          </Field>
          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
              {error}
            </p>
          )}
          {scrapedFrom && !error && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              Extracted readable text from{" "}
              <span className="font-medium break-all">{scrapedFrom}</span>. Review it
              in the preview →
            </p>
          )}
        </div>
      )}
    </div>
  );
}
