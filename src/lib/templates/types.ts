// Template system: each layout template shares the theme CSS but provides its own
// skeleton (structure + layout CSS). The builder composes header + content into the
// chosen template, then wraps it in the full document.

import type { BuildOptions, Heading, TemplateKey } from "../types";

export interface TemplateContext {
  /** Pre-rendered document header block (title/subtitle/meta/divider). */
  headerHtml: string;
  /** Final serialized content HTML. */
  contentHtml: string;
  headings: Heading[];
  opts: BuildOptions;
}

export interface Template {
  key: TemplateKey;
  label: string;
  /** Layout-specific CSS appended after the shared theme CSS. */
  skeletonCss: string;
  /** Render the inner <body> markup. */
  render(ctx: TemplateContext): string;
}
