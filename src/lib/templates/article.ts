import type { Template } from "./types";

/** Default layout: single centered reading column (close to v1 output). */
export const articleTemplate: Template = {
  key: "article",
  label: "Article",
  skeletonCss: `
.page { max-width: var(--measure); margin: 0 auto; padding: 64px 24px 96px; }
`.trim(),
  render({ headerHtml, contentHtml }) {
    return `<main class="page">
<header class="doc-header">
${headerHtml}
</header>
<article class="content">
${contentHtml}
</article>
</main>`;
  },
};
