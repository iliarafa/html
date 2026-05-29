import type { Template } from "./types";

/** Image-forward layout: figures tile into a responsive grid; text spans full width. */
export const galleryTemplate: Template = {
  key: "gallery",
  label: "Gallery",
  skeletonCss: `
.gallery-page { max-width: 960px; margin: 0 auto; padding: 56px 24px 96px; }
.gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; align-items: start; }
.gallery > :not(figure) { grid-column: 1 / -1; }
.gallery .figure { margin: 0; }
`.trim(),
  render({ headerHtml, contentHtml }) {
    return `<main class="gallery-page">
<header class="doc-header">
${headerHtml}
</header>
<div class="content gallery">
${contentHtml}
</div>
</main>`;
  },
};
