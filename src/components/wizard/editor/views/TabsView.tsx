"use client";

import { NodeViewContent, NodeViewWrapper, type NodeViewProps } from "@tiptap/react";

export default function TabsView({ editor, getPos, node }: NodeViewProps) {
  const addPanel = () => {
    const pos = getPos();
    if (typeof pos !== "number") return;
    const end = pos + node.nodeSize - 1; // inside the tabs node, after last panel
    editor
      .chain()
      .focus()
      .insertContentAt(end, {
        type: "tabPanel",
        attrs: { label: `Tab ${node.childCount + 1}` },
        content: [{ type: "paragraph" }],
      })
      .run();
  };

  return (
    <NodeViewWrapper
      as="div"
      className="my-3 rounded-lg border border-dashed border-emerald-200 bg-emerald-50/30 p-2"
    >
      <div
        contentEditable={false}
        className="mb-2 flex items-center gap-2 px-1"
      >
        <span className="text-[10px] uppercase tracking-wide text-emerald-400">tabs</span>
        <button
          type="button"
          onClick={addPanel}
          className="ml-auto rounded bg-emerald-500 px-2 py-0.5 text-xs font-medium text-white hover:bg-emerald-600"
        >
          + Tab
        </button>
      </div>
      <NodeViewContent className="space-y-2" />
    </NodeViewWrapper>
  );
}
