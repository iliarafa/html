"use client";

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1_000_000) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1_000_000).toFixed(1)} MB`;
}

export default function LivePreview({
  doc,
  hasContent,
  title,
  fileBytes,
  sandbox = "allow-scripts",
  emptyHint = "Your shareable page will appear here as you add content and tweak the look.",
}: {
  doc: string;
  hasContent: boolean;
  title: string;
  fileBytes: number;
  /** iframe sandbox value. AI pages pass "" (no scripts). */
  sandbox?: string;
  emptyHint?: string;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-zinc-300" />
        <span className="h-3 w-3 rounded-full bg-zinc-300" />
        <span className="h-3 w-3 rounded-full bg-zinc-300" />
        <span className="ml-2 truncate rounded-md bg-white px-3 py-1 text-xs text-zinc-400 ring-1 ring-zinc-200">
          {title || "untitled"}.html
        </span>
        <span className="ml-auto text-xs font-medium text-zinc-400">
          {hasContent ? formatBytes(fileBytes) : "Live preview"}
        </span>
      </div>
      {hasContent ? (
        <iframe
          title="Live preview"
          srcDoc={doc}
          className="min-h-[520px] flex-1 bg-white"
          sandbox={sandbox}
        />
      ) : (
        <div className="flex min-h-[520px] flex-1 flex-col items-center justify-center text-center text-zinc-400">
          <span className="text-4xl">◐</span>
          <p className="mt-3 max-w-xs text-sm">{emptyHint}</p>
        </div>
      )}
    </div>
  );
}
