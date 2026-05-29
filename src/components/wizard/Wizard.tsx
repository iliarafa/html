"use client";

import { useMemo, useState } from "react";
import { render } from "@/lib/parser";
import { buildDocument } from "@/lib/builder";
import { downloadHtml } from "@/lib/download";
import { initialState, STEPS, type WizardState } from "./state";
import InputStep from "./InputStep";
import DetailsStep from "./DetailsStep";
import ThemeStep from "./ThemeStep";
import ExtrasStep from "./ExtrasStep";
import PreviewStep from "./PreviewStep";
import LivePreview from "./LivePreview";

export default function Wizard() {
  const [state, setState] = useState<WizardState>(initialState);
  const [step, setStep] = useState(0);

  const update = (patch: Partial<WizardState>) =>
    setState((s) => ({ ...s, ...patch }));

  const hasContent = state.rawInput.trim().length > 0;

  const contentHtml = useMemo(
    () => (hasContent ? render(state.rawInput, state.inputType) : ""),
    [hasContent, state.rawInput, state.inputType],
  );

  const doc = useMemo(
    () =>
      buildDocument({
        contentHtml,
        title: state.title,
        subtitle: state.subtitle,
        author: state.author,
        date: state.date,
        mode: state.mode,
        accent: state.accent,
        extras: state.extras,
      }),
    [contentHtml, state],
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
      {/* Wizard panel */}
      <div className="flex flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        {/* step indicator */}
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
          {step === 0 && <InputStep state={state} update={update} />}
          {step === 1 && <DetailsStep state={state} update={update} />}
          {step === 2 && <ThemeStep state={state} update={update} />}
          {step === 3 && <ExtrasStep state={state} update={update} />}
          {step === 4 && (
            <PreviewStep
              state={state}
              hasContent={hasContent}
              onDownload={() => downloadHtml(doc, state.title)}
            />
          )}
        </div>

        {/* nav */}
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

      {/* Live preview */}
      <div className="min-h-[560px]">
        <LivePreview doc={doc} hasContent={hasContent} title={state.title} />
      </div>
    </div>
  );
}
