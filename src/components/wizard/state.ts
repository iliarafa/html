// Wizard state shape + helpers shared across step components (v2). Body content now
// lives in the TipTap editor (not in state); state holds metadata + design choices.

import { DEFAULT_THEME, type ReadingExtras, type TemplateKey, type ThemeConfig } from "@/lib/types";

export type SourceMode = "paste" | "upload" | "link";

export interface WizardState {
  title: string;
  subtitle: string;
  author: string;
  date: string;
  template: TemplateKey;
  theme: ThemeConfig;
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
    title: "",
    subtitle: "",
    author: "",
    date: formatToday(),
    template: "article",
    theme: { ...DEFAULT_THEME },
    extras: { themeToggle: true, readingTime: true, printStyles: true },
  };
}

export const STEPS = ["Input", "Edit", "Design", "Details", "Download"] as const;
