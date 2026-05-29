"use client";

import { NodeViewContent, NodeViewWrapper, type NodeViewProps } from "@tiptap/react";

export default function CollapsibleView({ node, updateAttributes }: NodeViewProps) {
  return (
    <NodeViewWrapper
      as="div"
      className="my-3 rounded-lg border border-zinc-200 bg-white"
    >
      <div
        contentEditable={false}
        className="flex items-center gap-2 border-b border-zinc-100 px-3 py-2"
      >
        <span className="text-zinc-400">▸</span>
        <input
          value={node.attrs.summary ?? ""}
          onChange={(e) => updateAttributes({ summary: e.target.value })}
          placeholder="Summary (click target)…"
          className="w-full bg-transparent text-sm font-medium text-zinc-800 outline-none placeholder:text-zinc-400"
        />
        <span className="shrink-0 rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-zinc-400">
          collapsible
        </span>
      </div>
      <NodeViewContent className="px-3 py-2" />
    </NodeViewWrapper>
  );
}
