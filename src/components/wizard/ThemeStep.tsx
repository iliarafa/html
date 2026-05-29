"use client";

import { ACCENTS } from "@/lib/types";
import type { WizardState } from "./state";
import { SegMode, StepLabel, StepTitle } from "./ui";

export default function ThemeStep({
  state,
  update,
}: {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
}) {
  return (
    <div>
      <StepLabel>Step 3</StepLabel>
      <StepTitle>Theme</StepTitle>

      <p className="mb-2 text-sm font-medium text-zinc-700">Default appearance</p>
      <div className="mb-6">
        <SegMode
          value={state.mode}
          onChange={(v) => update({ mode: v as WizardState["mode"] })}
          options={[
            { value: "light", label: "☀ Light" },
            { value: "dark", label: "☾ Dark" },
          ]}
        />
      </div>

      <p className="mb-2 text-sm font-medium text-zinc-700">Accent color</p>
      <div className="flex gap-3">
        {ACCENTS.map((a) => (
          <button
            key={a.key}
            type="button"
            onClick={() => update({ accent: a.key })}
            title={a.label}
            className={`h-10 w-10 rounded-full transition ${
              state.accent === a.key
                ? "ring-2 ring-zinc-900 ring-offset-2"
                : "ring-1 ring-zinc-200 hover:ring-zinc-400"
            }`}
            style={{ backgroundColor: a.hex }}
            aria-label={a.label}
          />
        ))}
      </div>
    </div>
  );
}
