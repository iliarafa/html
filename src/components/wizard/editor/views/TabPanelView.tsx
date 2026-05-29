"use client";

import { NodeViewContent, NodeViewWrapper, type NodeViewProps } from "@tiptap/react";

export default function TabPanelView({ node, updateAttributes, deleteNode }: NodeViewProps) {
  return (
    <NodeViewWrapper as="section" className="rounded-lg border border-zinc-200 bg-white">
      <div
        contentEditable={false}
        className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50 px-3 py-1.5"
      >
        <span className="text-[10px] uppercase tracking-wide text-zinc-400">tab</span>
        <input
          value={node.attrs.label ?? ""}
          onChange={(e) => updateAttributes({ label: e.target.value })}
          placeholder="Tab label…"
          className="w-full bg-transparent text-sm font-medium text-zinc-800 outline-none placeholder:text-zinc-400"
        />
        <button
          type="button"
          onClick={() => deleteNode()}
          className="shrink-0 text-zinc-400 hover:text-rose-500"
          title="Remove tab"
        >
          ✕
        </button>
      </div>
      <NodeViewContent className="px-3 py-2" />
    </NodeViewWrapper>
  );
}
