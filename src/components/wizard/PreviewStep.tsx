"use client";

import type { WizardState } from "./state";
import { StepLabel, StepTitle } from "./ui";

export default function PreviewStep({
  state,
  hasContent,
  onDownload,
}: {
  state: WizardState;
  hasContent: boolean;
  onDownload: () => void;
}) {
  const extras = [
    state.extras.themeToggle && "light/dark switch",
    state.extras.readingTime && "reading time",
    state.extras.printStyles && "print styles",
  ].filter(Boolean);

  return (
    <div>
      <StepLabel>Step 5</StepLabel>
      <StepTitle>Review &amp; download</StepTitle>

      <dl className="mb-6 space-y-2 text-sm">
        <Row label="Title" value={state.title || "Untitled"} />
        <Row
          label="Theme"
          value={`${state.mode === "dark" ? "Dark" : "Light"} · ${state.accent}`}
        />
        <Row label="Extras" value={extras.length ? extras.join(", ") : "none"} />
      </dl>

      <button
        type="button"
        onClick={onDownload}
        disabled={!hasContent}
        className="w-full rounded-lg bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        ⤓ Download .html
      </button>
      {!hasContent && (
        <p className="mt-2 text-center text-xs text-zinc-400">
          Add some content in Step 1 first.
        </p>
      )}
      <p className="mt-3 text-center text-xs text-zinc-400">
        One self-contained file. Opens offline in any browser.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-zinc-100 pb-2">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="truncate font-medium text-zinc-800">{value}</dd>
    </div>
  );
}
