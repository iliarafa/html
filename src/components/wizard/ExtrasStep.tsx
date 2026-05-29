"use client";

import type { WizardState } from "./state";
import { StepLabel, StepTitle, Toggle } from "./ui";

export default function ExtrasStep({
  state,
  update,
}: {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
}) {
  const { extras } = state;
  const set = (patch: Partial<WizardState["extras"]>) =>
    update({ extras: { ...extras, ...patch } });

  return (
    <div>
      <StepLabel>Step 4</StepLabel>
      <StepTitle>Reading extras</StepTitle>

      <div className="space-y-3">
        <Toggle
          checked={extras.themeToggle}
          onChange={(v) => set({ themeToggle: v })}
          label="Light/dark switch button"
          hint="Embed a button so the receiver can flip themes in the file."
        />
        <Toggle
          checked={extras.readingTime}
          onChange={(v) => set({ readingTime: v })}
          label="Reading-time estimate"
          hint="Show an approximate “X min read” in the header."
        />
        <Toggle
          checked={extras.printStyles}
          onChange={(v) => set({ printStyles: v })}
          label="Print-friendly styling"
          hint="Clean layout when the receiver prints or saves as PDF."
        />
      </div>
    </div>
  );
}
