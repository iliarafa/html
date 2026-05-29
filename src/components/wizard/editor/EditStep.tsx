"use client";

import { EditorContent, type Editor } from "@tiptap/react";
import Toolbar from "./Toolbar";
import { StepLabel, StepTitle } from "../ui";

export default function EditStep({
  editor,
  hasContent,
}: {
  editor: Editor | null;
  hasContent: boolean;
}) {
  return (
    <div className="flex h-full flex-col">
      <StepLabel>Step 2</StepLabel>
      <StepTitle>Edit your content</StepTitle>
      {!hasContent && (
        <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Tip: add content in Step 1 first, or just start typing below.
        </p>
      )}
      <div className="flex min-h-[420px] flex-1 flex-col overflow-hidden rounded-xl border border-zinc-200">
        {editor && <Toolbar editor={editor} />}
        <EditorContent
          editor={editor}
          className="editor-content flex-1 overflow-y-auto bg-white px-4 py-3"
        />
      </div>
    </div>
  );
}
