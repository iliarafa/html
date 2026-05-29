"use client";

export default function LivePreview({
  doc,
  hasContent,
  title,
}: {
  doc: string;
  hasContent: boolean;
  title: string;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      {/* fake browser chrome */}
      <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-zinc-300" />
        <span className="h-3 w-3 rounded-full bg-zinc-300" />
        <span className="h-3 w-3 rounded-full bg-zinc-300" />
        <span className="ml-2 truncate rounded-md bg-white px-3 py-1 text-xs text-zinc-400 ring-1 ring-zinc-200">
          {title || "untitled"}.html
        </span>
        <span className="ml-auto text-xs font-medium text-zinc-400">Live preview</span>
      </div>
      {hasContent ? (
        <iframe
          title="Live preview"
          srcDoc={doc}
          className="min-h-[520px] flex-1 bg-white"
          sandbox="allow-scripts"
        />
      ) : (
        <div className="flex min-h-[520px] flex-1 flex-col items-center justify-center text-center text-zinc-400">
          <span className="text-4xl">◐</span>
          <p className="mt-3 max-w-xs text-sm">
            Your shareable page will appear here as you add content and tweak the look.
          </p>
        </div>
      )}
    </div>
  );
}
