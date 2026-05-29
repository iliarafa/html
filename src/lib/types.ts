// Shared types for the notes -> shareable HTML pipeline.

/** How the raw input should be interpreted before rendering. */
export type InputType = "markdown" | "text" | "html";

export type ThemeMode = "light" | "dark";

export type AccentKey = "indigo" | "emerald" | "rose" | "amber" | "slate";

export const ACCENTS: { key: AccentKey; label: string; hex: string }[] = [
  { key: "indigo", label: "Indigo", hex: "#6366f1" },
  { key: "emerald", label: "Emerald", hex: "#10b981" },
  { key: "rose", label: "Rose", hex: "#f43f5e" },
  { key: "amber", label: "Amber", hex: "#f59e0b" },
  { key: "slate", label: "Slate", hex: "#64748b" },
];

/** Toggles surfaced in the "reading extras" wizard step. */
export interface ReadingExtras {
  themeToggle: boolean;
  readingTime: boolean;
  printStyles: boolean;
}

/** Everything the Builder needs to assemble the final document. */
export interface BuildOptions {
  /** Already-rendered, sanitized content HTML (from the Parser). */
  contentHtml: string;
  title: string;
  subtitle?: string;
  author?: string;
  /** Display date string, e.g. "May 29, 2026". */
  date?: string;
  mode: ThemeMode;
  accent: AccentKey;
  extras: ReadingExtras;
}
