"use client";

import type { WizardState } from "./state";
import { Field, StepLabel, StepTitle, TextInput, Toggle } from "./ui";

export default function DetailsStep({
  state,
  update,
}: {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
}) {
  const { extras } = state;
  const setExtras = (patch: Partial<WizardState["extras"]>) =>
    update({ extras: { ...extras, ...patch } });

  return (
    <div>
      <StepLabel>Step 4</StepLabel>
      <StepTitle>Details &amp; extras</StepTitle>

      <Field label="Title" hint="Shown in the browser tab and at the top of the page.">
        <TextInput value={state.title} onChange={(e) => update({ title: e.target.value })} placeholder="My Notes" />
      </Field>
      <Field label="Subtitle (optional)">
        <TextInput value={state.subtitle} onChange={(e) => update({ subtitle: e.target.value })} placeholder="A short description" />
      </Field>
      <Field label="Author (optional)">
        <TextInput value={state.author} onChange={(e) => update({ author: e.target.value })} placeholder="Your name" />
      </Field>
      <Field label="Date">
        <TextInput value={state.date} onChange={(e) => update({ date: e.target.value })} placeholder="May 29, 2026" />
      </Field>

      <p className="mb-2 mt-6 text-sm font-medium text-zinc-700">Reading extras</p>
      <div className="space-y-3">
        <Toggle
          checked={extras.themeToggle}
          onChange={(v) => setExtras({ themeToggle: v })}
          label="Light/dark switch button"
          hint="Embed a button so the receiver can flip themes in the file."
        />
        <Toggle
          checked={extras.readingTime}
          onChange={(v) => setExtras({ readingTime: v })}
          label="Reading-time estimate"
          hint="Show an approximate “X min read” in the header."
        />
        <Toggle
          checked={extras.printStyles}
          onChange={(v) => setExtras({ printStyles: v })}
          label="Print-friendly styling"
          hint="Clean layout when the receiver prints or saves as PDF."
        />
      </div>
    </div>
  );
}
