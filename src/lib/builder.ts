// Builder: assembles the final self-contained HTML document string from rendered
// content + metadata + theme + reading extras. Everything (CSS, optional toggle
// JS) is inlined so the file works offline with zero external dependencies.

import { buildThemeCss } from "./theme";
import type { BuildOptions } from "./types";

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Estimate reading time in minutes from rendered content (~200 wpm). */
export function readingMinutes(contentHtml: string): number {
  const text = contentHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const words = text ? text.split(" ").length : 0;
  return Math.max(1, Math.round(words / 200));
}

const PRINT_CSS = `
@media print {
  .theme-toggle { display: none; }
  body { background: #fff; color: #000; font-size: 12pt; }
  .page { max-width: none; padding: 0; }
  .content a { color: #000; border-bottom: none; }
  .content pre, .content :not(pre) > code { background: #fff; border-color: #ccc; }
}`;

function toggleScript(): string {
  // Minimal, self-contained light/dark switch. No dependencies.
  return `<script>(function(){var r=document.documentElement,b=document.querySelector('.theme-toggle');function s(t){r.setAttribute('data-theme',t);if(b)b.textContent=t==='dark'?'\\u25D1 Light':'\\u25D0 Dark';}if(b)b.addEventListener('click',function(){s(r.getAttribute('data-theme')==='dark'?'light':'dark');});})();</script>`;
}

/** Build the complete HTML document string ready for download. */
export function buildDocument(opts: BuildOptions): string {
  const { title, subtitle, author, date, mode, accent, extras, contentHtml } = opts;

  const css = buildThemeCss(accent) + (extras.printStyles ? PRINT_CSS : "");

  const metaParts: string[] = [];
  if (author) metaParts.push(escapeHtml(author));
  if (date) metaParts.push(escapeHtml(date));
  if (extras.readingTime) metaParts.push(`${readingMinutes(contentHtml)} min read`);
  const metaLine = metaParts.length
    ? `<p class="doc-meta">${metaParts.join(" &middot; ")}</p>`
    : "";

  const subtitleLine = subtitle
    ? `<p class="doc-subtitle">${escapeHtml(subtitle)}</p>`
    : "";

  const toggleButton = extras.themeToggle
    ? `<button class="theme-toggle" type="button" aria-label="Toggle light or dark theme">${mode === "dark" ? "◑ Light" : "◐ Dark"}</button>`
    : "";

  const script = extras.themeToggle ? toggleScript() : "";

  return `<!DOCTYPE html>
<html lang="en" data-theme="${mode}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title || "Note")}</title>
<style>
${css}
</style>
</head>
<body>
${toggleButton}
<main class="page">
<header>
<h1 class="doc-title">${escapeHtml(title || "Untitled")}</h1>
${subtitleLine}
${metaLine}
<hr class="doc-divider">
</header>
<article class="content">
${contentHtml}
</article>
</main>
${script}
</body>
</html>`;
}
