# Notes → Shareable HTML

Turn notes, files, or a link into a single **self-contained `.html` file** you can
send to anyone. They open it in any browser — works fully offline, no server, no
dependencies.

## How it works

A wizard walks you through five steps:

1. **Input** — paste text, upload a `.md`/`.txt` file, or paste a **link** (the page
   is fetched server-side and the readable article text is extracted, images stripped).
2. **Details** — title, subtitle, author, date.
3. **Theme** — one clean/modern/code-friendly theme with a default light/dark mode and
   five accent presets.
4. **Reading extras** — embedded light/dark toggle, reading-time estimate, print styles.
5. **Preview & download** — review the live preview, download the file.

The downloaded file inlines all CSS (and a tiny toggle script) so it renders offline
with zero external requests. Code blocks are syntax-highlighted at generation time.

## Architecture

| Module | Path | Responsibility |
| --- | --- | --- |
| Scraper | `src/app/api/scrape/route.ts` | Fetch URL, Readability extract, strip media, SSRF/timeout/size guards |
| Parser | `src/lib/parser.ts` | Markdown / text / scraped-HTML → safe HTML (marked + DOMPurify + highlight.js) |
| Theme | `src/lib/theme.ts` | `{accent}` → light/dark CSS string |
| Builder | `src/lib/builder.ts` | Content + metadata + theme + extras → self-contained HTML document |
| Download | `src/lib/download.ts` | Blob download with a slugged filename |
| Wizard UI | `src/components/wizard/*` | Step components + live preview iframe |

## Develop

```bash
npm run dev      # http://localhost:3000
npm test         # Vitest unit tests
npm run build    # production build
```

## Out of scope (v1)

`.docx` upload, password/encryption, auto table-of-contents, hosting/shareable links,
inlining scraped images, custom color picker.
