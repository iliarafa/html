// Wizard state shape + helpers shared across step components.

import type { AccentKey, InputType, ReadingExtras, ThemeMode } from "@/lib/types";

export type SourceMode = "paste" | "upload" | "link";

export interface WizardState {
  sourceMode: SourceMode;
  /** How rawInput should be parsed: markdown (paste/.md), text (.txt), html (scraped). */
  inputType: InputType;
  rawInput: string;
  title: string;
  subtitle: string;
  author: string;
  date: string;
  mode: ThemeMode;
  accent: AccentKey;
  extras: ReadingExtras;
}

/** Human-friendly date like "May 29, 2026". */
export function formatToday(): string {
  return new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function initialState(): WizardState {
  return {
    sourceMode: "paste",
    inputType: "markdown",
    rawInput: "",
    title: "",
    subtitle: "",
    author: "",
    date: formatToday(),
    mode: "light",
    accent: "indigo",
    extras: { themeToggle: true, readingTime: true, printStyles: true },
  };
}

export const STEPS = ["Input", "Details", "Theme", "Extras", "Preview"] as const;
