"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useEditor } from "@tiptap/react";
import { extensions } from "./editor/extensions";
import { serializeContent } from "@/lib/editor/serialize";
import { buildDocument } from "@/lib/builder";
import { downloadHtml } from "@/lib/download";
import { initialState, STEPS, type WizardState } from "./state";
import InputStep from "./InputStep";
import EditStep from "./editor/EditStep";
import DesignStep from "./DesignStep";
import DetailsStep from "./DetailsStep";
import PreviewStep from "./PreviewStep";
import LivePreview from "./LivePreview";

export default function Wizard() {
  const [state, setState] = useState<WizardState>(initialState);
  const [step, setStep] = useState(0);
  const [editorHtml, setEditorHtml] = useState("");
  const [doc, setDoc] = useState("");
  const [fileBytes, setFileBytes] = useState(0);

  const editor = useEditor({
    extensions,
    content: "",
    immediatelyRender: false,
    editorProps: { attributes: { class: "tiptap focus:outline-none" } },
    onUpdate: ({ editor }) => setEditorHtml(editor.getHTML()),
  });

  const update = (patch: Partial<WizardState>) => setState((s) => ({ ...s, ...patch }));

  const seed = useCallback(
    (html: string) => {
      if (!editor) return;
      editor.commands.setContent(html);
      setEditorHtml(editor.getHTML());
    },
    [editor],
  );

  const hasContent = useMemo(() => {
    const text = editorHtml.replace(/<[^>]*>/g, "").trim();
    return text.length > 0 || /<(img|figure|table|hr)/.test(editorHtml);
  }, [editorHtml]);

  // Debounced serialize -> build so typing doesn't re-highlight on every keystroke.
  useEffect(() => {
    const id = setTimeout(() => {
      if (!hasContent) {
        setDoc("");
        setFileBytes(0);
        return;
      }
      const { html, usesTabs, headings } = serializeContent(editorHtml);
      const d = buildDocument({
        contentHtml: html,
        title: state.title,
        subtitle: state.subtitle,
        author: state.author,
        date: state.date,
        theme: state.theme,
        template: state.template,
        extras: state.extras,
        usesTabs,
        headings,
      });
      setDoc(d);
      setFileBytes(new Blob([d]).size);
    }, 250);
    return () => clearTimeout(id);
  }, [editorHtml, state, hasContent]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,440px)_1fr]">
      <div className="flex flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-1.5">
          {STEPS.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => setStep(i)}
              className="group flex flex-1 flex-col gap-1.5"
              title={label}
            >
              <span
                className={`h-1 rounded-full transition ${
                  i <= step ? "bg-indigo-500" : "bg-zinc-200 group-hover:bg-zinc-300"
                }`}
              />
            </button>
          ))}
        </div>

        <div className="flex-1">
          {/* EditStep stays mounted across steps to preserve editor state + undo. */}
          <div className={step === 0 ? "" : "hidden"}>
            <InputStep state={state} update={update} seed={seed} goNext={() => setStep(1)} />
          </div>
          <div className={step === 1 ? "flex h-full flex-col" : "hidden"}>
            <EditStep editor={editor} hasContent={hasContent} />
          </div>
          {step === 2 && <DesignStep state={state} update={update} />}
          {step === 3 && <DetailsStep state={state} update={update} />}
          {step === 4 && (
            <PreviewStep
              state={state}
              hasContent={hasContent}
              fileBytes={fileBytes}
              onDownload={() => downloadHtml(doc, state.title)}
            />
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-800 disabled:opacity-30"
          >
            ← Back
          </button>
          <span className="text-xs text-zinc-400">
            {step + 1} / {STEPS.length}
          </span>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
            >
              Next →
            </button>
          ) : (
            <span className="w-[70px]" />
          )}
        </div>
      </div>

      <div className="min-h-[560px]">
        <LivePreview doc={doc} hasContent={hasContent} title={state.title} fileBytes={fileBytes} />
      </div>
    </div>
  );
}
