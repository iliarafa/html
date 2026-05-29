// Builder: orchestrates the final self-contained HTML document. Composes theme CSS +
// the chosen template's skeleton CSS + optional print CSS, renders the header and the
// chosen layout template, and inlines JS only when needed (tabs controller iff the
// content uses tabs; theme toggle iff enabled). Everything is inlined — the only
// non-text resources allowed are base64 data: images.

import { buildThemeCss } from "./theme";
import { getTemplate } from "./templates";
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
  .doc-toc { display: none; }
  details { } details > * { display: block !important; }
  .tabs .tablist { display: none; }
  .tabs .tabpanel[hidden] { display: block !important; }
  .content a { color: #000; border-bottom: none; }
  .content pre, .content :not(pre) > code { background: #fff; border-color: #ccc; }
}`;

function toggleScript(): string {
  return `<script>(function(){var r=document.documentElement,b=document.querySelector('.theme-toggle');function s(t){r.setAttribute('data-theme',t);if(b)b.textContent=t==='dark'?'\\u25D1 Light':'\\u25D0 Dark';}if(b)b.addEventListener('click',function(){s(r.getAttribute('data-theme')==='dark'?'light':'dark');});})();</script>`;
}

function tabsScript(): string {
  return `<script>(function(){document.querySelectorAll('.tabs[data-tabs]').forEach(function(t){var list=t.querySelector('.tablist');if(!list)return;var tabs=list.querySelectorAll('.tab'),panels=t.querySelectorAll('.tabpanels > .tabpanel');list.addEventListener('click',function(e){var b=e.target.closest('.tab');if(!b)return;var i=Array.prototype.indexOf.call(tabs,b);tabs.forEach(function(x,j){x.setAttribute('aria-selected',j===i?'true':'false');});panels.forEach(function(p,j){if(j===i)p.removeAttribute('hidden');else p.setAttribute('hidden','');});});});})();</script>`;
}

function buildHeader(opts: BuildOptions): string {
  const { title, subtitle, author, date, extras, contentHtml } = opts;
  const metaParts: string[] = [];
  if (author) metaParts.push(escapeHtml(author));
  if (date) metaParts.push(escapeHtml(date));
  if (extras.readingTime) metaParts.push(`${readingMinutes(contentHtml)} min read`);

  const subtitleLine = subtitle
    ? `<p class="doc-subtitle">${escapeHtml(subtitle)}</p>`
    : "";
  const metaLine = metaParts.length
    ? `<p class="doc-meta">${metaParts.join(" &middot; ")}</p>`
    : "";

  return `<h1 class="doc-title">${escapeHtml(title || "Untitled")}</h1>
${subtitleLine}
${metaLine}
<hr class="doc-divider">`;
}

/** Build the complete HTML document string ready for download. */
export function buildDocument(opts: BuildOptions): string {
  const { theme, template, extras, usesTabs, headings = [] } = opts;

  const tpl = getTemplate(template);
  const css = buildThemeCss(theme) + "\n" + tpl.skeletonCss + (extras.printStyles ? PRINT_CSS : "");

  const body = tpl.render({
    headerHtml: buildHeader(opts),
    contentHtml: opts.contentHtml,
    headings,
    opts,
  });

  const toggleButton = extras.themeToggle
    ? `<button class="theme-toggle" type="button" aria-label="Toggle light or dark theme">${theme.mode === "dark" ? "◑ Light" : "◐ Dark"}</button>`
    : "";

  const scripts =
    (extras.themeToggle ? toggleScript() : "") + (usesTabs ? tabsScript() : "");

  return `<!DOCTYPE html>
<html lang="en" data-theme="${theme.mode}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(opts.title || "Note")}</title>
<style>
${css}
</style>
</head>
<body>
${toggleButton}
${body}
${scripts}
</body>
</html>`;
}
