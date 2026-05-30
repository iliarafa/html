"use client";

import { useState } from "react";
import { SegMode, TextInput } from "../wizard/ui";

/** Compact content acquisition for AI mode: returns a plain-text string. */
export default function ContentInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (text: string) => void;
}) {
  const [mode, setMode] = useState<"paste" | "upload" | "link">("paste");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function readFile(file: File) {
    onChange(await file.text());
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
      // Convert scraped HTML to readable text for the model.
      const text = new DOMParser().parseFromString(data.html, "text/html").body
        .textContent?.replace(/\n{3,}/g, "\n\n")
        .trim();
      onChange([data.title, data.author, text].filter(Boolean).join("\n\n"));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-3">
        <SegMode
          value={mode}
          onChange={(v) => setMode(v as typeof mode)}
          options={[
            { value: "paste", label: "Paste" },
            { value: "upload", label: "Upload" },
            { value: "link", label: "Link" },
          ]}
        />
      </div>

      {mode === "paste" && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste the notes / content you want designed…"
          className="h-40 w-full resize-y rounded-lg border border-zinc-300 bg-white p-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
        />
      )}

      {mode === "upload" && (
        <label className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-white text-center transition hover:border-emerald-400 hover:bg-emerald-50/30">
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
            {value ? "Loaded ✓ — choose another to replace" : "Choose a .md or .txt file"}
          </span>
        </label>
      )}

      {mode === "link" && (
        <div>
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
              {loading ? "…" : "Fetch"}
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
          {value && !error && (
            <p className="mt-2 text-xs text-emerald-700">
              Loaded {value.length.toLocaleString()} characters of content.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
