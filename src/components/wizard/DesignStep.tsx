"use client";

import { COLOR_SCHEMES, FONT_PAIRINGS, type TemplateKey } from "@/lib/types";
import { TEMPLATES } from "@/lib/templates";
import type { WizardState } from "./state";
import { SegMode, StepLabel, StepTitle } from "./ui";

export default function DesignStep({
  state,
  update,
}: {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
}) {
  const { theme } = state;
  const setTheme = (patch: Partial<WizardState["theme"]>) =>
    update({ theme: { ...theme, ...patch } });

  return (
    <div>
      <StepLabel>Step 3</StepLabel>
      <StepTitle>Design</StepTitle>

      <p className="mb-2 text-sm font-medium text-zinc-700">Layout template</p>
      <div className="mb-6 grid grid-cols-2 gap-2">
        {TEMPLATES.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => update({ template: t.key as TemplateKey })}
            className={`rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition ${
              state.template === t.key
                ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <p className="mb-2 text-sm font-medium text-zinc-700">Default appearance</p>
      <div className="mb-6">
        <SegMode
          value={theme.mode}
          onChange={(v) => setTheme({ mode: v as "light" | "dark" })}
          options={[
            { value: "light", label: "☀ Light" },
            { value: "dark", label: "☾ Dark" },
          ]}
        />
      </div>

      <p className="mb-2 text-sm font-medium text-zinc-700">Accent color</p>
      <div className="mb-6 flex flex-wrap gap-3">
        {COLOR_SCHEMES.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setTheme({ scheme: s.key })}
            title={s.label}
            aria-label={s.label}
            className={`h-9 w-9 rounded-full transition ${
              theme.scheme === s.key
                ? "ring-2 ring-zinc-900 ring-offset-2"
                : "ring-1 ring-zinc-200 hover:ring-zinc-400"
            }`}
            style={{ backgroundColor: theme.mode === "dark" ? s.dark : s.light }}
          />
        ))}
      </div>

      <p className="mb-2 text-sm font-medium text-zinc-700">Typeface</p>
      <div className="mb-6 grid grid-cols-2 gap-2">
        {FONT_PAIRINGS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setTheme({ font: f.key })}
            style={{ fontFamily: f.heading }}
            className={`rounded-lg border px-3 py-2.5 text-left text-sm transition ${
              theme.font === f.key
                ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <p className="mb-2 text-sm font-medium text-zinc-700">Density</p>
      <SegMode
        value={theme.density}
        onChange={(v) => setTheme({ density: v as "comfortable" | "compact" })}
        options={[
          { value: "comfortable", label: "Comfortable" },
          { value: "compact", label: "Compact" },
        ]}
      />
    </div>
  );
}
