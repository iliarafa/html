import type { Template } from "./types";

/** Narrow, centered, letterhead-style layout for personal or formal notes. */
export const letterTemplate: Template = {
  key: "letter",
  label: "Letter",
  skeletonCss: `
.letter { max-width: 600px; margin: 0 auto; padding: 80px 24px 96px; }
.letter .doc-header { text-align: center; margin-bottom: 8px; }
.letter .doc-header .doc-divider { width: 60px; margin-left: auto; margin-right: auto; border-top-width: 2px; border-color: var(--accent); }
.letter h1.doc-title { font-size: 30px; }
`.trim(),
  render({ headerHtml, contentHtml }) {
    return `<main class="letter">
<header class="doc-header">
${headerHtml}
</header>
<article class="content">
${contentHtml}
</article>
</main>`;
  },
};
