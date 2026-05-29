// Shared types for the notes -> shareable HTML pipeline (v2).

/** How raw input is interpreted when seeding the editor. */
export type InputType = "markdown" | "text" | "html";

export type ThemeMode = "light" | "dark";

// --- Color schemes (accent hue, with light + dark variants) ---

export type ColorSchemeKey =
  | "indigo"
  | "emerald"
  | "rose"
  | "amber"
  | "slate"
  | "violet"
  | "teal"
  | "crimson";

export interface ColorScheme {
  key: ColorSchemeKey;
  label: string;
  light: string;
  dark: string;
}

export const COLOR_SCHEMES: ColorScheme[] = [
  { key: "indigo", label: "Indigo", light: "#6366f1", dark: "#818cf8" },
  { key: "violet", label: "Violet", light: "#7c3aed", dark: "#a78bfa" },
  { key: "emerald", label: "Emerald", light: "#10b981", dark: "#34d399" },
  { key: "teal", label: "Teal", light: "#0d9488", dark: "#2dd4bf" },
  { key: "rose", label: "Rose", light: "#f43f5e", dark: "#fb7185" },
  { key: "crimson", label: "Crimson", light: "#dc2626", dark: "#f87171" },
  { key: "amber", label: "Amber", light: "#d97706", dark: "#fbbf24" },
  { key: "slate", label: "Slate", light: "#475569", dark: "#94a3b8" },
];

// --- Font pairings (system / web-safe stacks only — no web fonts, keeps offline) ---

export type FontPairingKey = "modern" | "editorial" | "classic" | "mono";

export interface FontPairing {
  key: FontPairingKey;
  label: string;
  heading: string;
  body: string;
  mono: string;
}

const MONO = `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace`;

export const FONT_PAIRINGS: FontPairing[] = [
  {
    key: "modern",
    label: "Modern",
    heading: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`,
    body: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`,
    mono: MONO,
  },
  {
    key: "editorial",
    label: "Editorial",
    heading: `"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif`,
    body: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`,
    mono: MONO,
  },
  {
    key: "classic",
    label: "Classic",
    heading: `Georgia, "Times New Roman", Times, serif`,
    body: `Georgia, "Times New Roman", Times, serif`,
    mono: MONO,
  },
  {
    key: "mono",
    label: "Mono",
    heading: MONO,
    body: MONO,
    mono: MONO,
  },
];

export type Density = "comfortable" | "compact";

/** The full visual configuration of the output document. */
export interface ThemeConfig {
  mode: ThemeMode;
  scheme: ColorSchemeKey;
  font: FontPairingKey;
  density: Density;
}

export const DEFAULT_THEME: ThemeConfig = {
  mode: "light",
  scheme: "indigo",
  font: "modern",
  density: "comfortable",
};

// --- Layout templates ---

export type TemplateKey = "article" | "documentation" | "gallery" | "letter";

// --- Output document options ---

export interface ReadingExtras {
  themeToggle: boolean;
  readingTime: boolean;
  printStyles: boolean;
}

/** A heading extracted from content, used to build a table of contents. */
export interface Heading {
  id: string;
  text: string;
  level: number;
}

/** Everything the Builder needs to assemble the final document. */
export interface BuildOptions {
  /** Already-rendered, sanitized, highlighted content HTML (from the serializer). */
  contentHtml: string;
  title: string;
  subtitle?: string;
  author?: string;
  /** Display date string, e.g. "May 29, 2026". */
  date?: string;
  theme: ThemeConfig;
  template: TemplateKey;
  extras: ReadingExtras;
  /** Whether the content uses tab blocks (controls inlining the tabs JS). */
  usesTabs?: boolean;
  /** Headings for templates that render a table of contents. */
  headings?: Heading[];
}
