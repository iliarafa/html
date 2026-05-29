import type { Heading } from "../types";
import type { Template } from "./types";

function tocHtml(headings: Heading[]): string {
  if (!headings.length) return "";
  const items = headings
    .filter((h) => h.level === 2 || h.level === 3)
    .map((h) => `<li class="toc-l${h.level}"><a href="#${h.id}">${h.text}</a></li>`)
    .join("");
  if (!items) return "";
  return `<nav class="doc-toc" aria-label="Table of contents">
<div class="doc-toc-title">Contents</div>
<ul>${items}</ul>
</nav>`;
}

/** Two-column docs layout with a static table of contents built from headings. */
export const documentationTemplate: Template = {
  key: "documentation",
  label: "Documentation",
  skeletonCss: `
.doc-shell { max-width: 1040px; margin: 0 auto; padding: 56px 24px 96px; display: grid; grid-template-columns: 220px 1fr; gap: 48px; align-items: start; }
.doc-toc { position: sticky; top: 32px; font-size: 14px; }
.doc-toc-title { font-weight: 600; text-transform: uppercase; letter-spacing: .06em; font-size: 12px; color: var(--muted); margin-bottom: 10px; }
.doc-toc ul { list-style: none; margin: 0; padding: 0; border-left: 1px solid var(--border); }
.doc-toc li { margin: 0; }
.doc-toc a { display: block; padding: 4px 0 4px 14px; margin-left: -1px; border-left: 2px solid transparent; color: var(--muted); text-decoration: none; }
.doc-toc a:hover { color: var(--text); }
.doc-toc .toc-l3 a { padding-left: 28px; font-size: 13px; }
.doc-main { min-width: 0; }
@media (max-width: 760px) { .doc-shell { grid-template-columns: 1fr; } .doc-toc { position: static; } }
`.trim(),
  render({ headerHtml, contentHtml, headings }) {
    return `<div class="doc-shell">
${tocHtml(headings)}
<main class="doc-main">
<header class="doc-header">
${headerHtml}
</header>
<article class="content">
${contentHtml}
</article>
</main>
</div>`;
  },
};
