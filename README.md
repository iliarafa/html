# Notes → Shareable HTML

Turn notes, files, or a link into a single **self-contained `.html` file** you can
send to anyone. They open it in any browser — works fully offline, no server, no
dependencies. Edit the content in a WYSIWYG editor, add interactive blocks, pick a
layout and theme, then download.

## How it works

A five-step wizard:

1. **Input** — paste Markdown/text, upload a `.md`/`.txt` file, or paste a **link**
   (the page is fetched server-side, the readable article extracted, and its **images
   inlined as base64**).
2. **Edit** — a WYSIWYG editor (TipTap). Format text, and insert blocks: callouts,
   quote cards, two-column splits, image+caption, **collapsible sections**, and
   **tabs**. Upload images (downscaled + embedded).
3. **Design** — choose a layout **template** (Article, Documentation w/ TOC, Gallery,
   Letter), light/dark default, accent color, typeface, and density.
4. **Details** — title, subtitle, author, date, and reading extras (light/dark toggle,
   reading time, print styles).
5. **Download** — review the live preview + file size, download the file.

The downloaded file inlines all CSS, base64 images, and a tiny JS controller (the
tabs switcher and theme toggle, only when used). Collapsibles use native `<details>`
(zero JS). Code is syntax-highlighted at generation time. The only non-text resources
are base64 `data:` images — there are **no external `http(s)` resource URLs**, so it
renders fully offline.

## Architecture

The editor document is the single source of truth: input seeds it, and the builder
consumes its serialized HTML.

| Module | Path | Responsibility |
| --- | --- | --- |
| Scraper | `src/app/api/scrape/route.ts` | Fetch URL, Readability extract, **inline images as base64**; SSRF (page + each image host), timeout, size/count caps |
| Importer / sanitizer | `src/lib/parser.ts` | Markdown/text/HTML → seed HTML; DOMPurify allowlist (data: images only, blocks, no svg/script) |
| Serializer | `src/lib/editor/serialize.ts` | Editor HTML → final content: highlight code, slug headings (TOC), expand tabs, sanitize |
| Highlight | `src/lib/highlight.ts` | Shared highlight.js helper |
| Theme | `src/lib/theme.ts` | `ThemeConfig` (scheme + font + density) → light/dark CSS |
| Templates | `src/lib/templates/*` | Article / Documentation / Gallery / Letter skeletons |
| Builder | `src/lib/builder.ts` | Content + metadata + theme + template + extras → self-contained doc; inlines tabs/toggle JS conditionally |
| Images | `src/lib/images/process.ts` | Client-side canvas downscale → base64 for uploads |
| Editor | `src/components/wizard/editor/*` | TipTap extensions, custom nodes, NodeViews, toolbar |
| Wizard UI | `src/components/wizard/*` | Steps + single editor instance + debounced live preview |

## Develop

```bash
npm run dev      # http://localhost:3000
npm test         # Vitest unit tests
npm run build    # production build
```

## Out of scope

`.docx` upload, password/encryption, scrollspy TOC / lightbox, saving & reopening
drafts, web-font embedding, image resizing via `sharp`, hosting/shareable links.
Importing a scraped page flattens tags TipTap doesn't recognize to paragraphs.
