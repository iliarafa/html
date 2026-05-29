// Parser / importer: turns raw input (markdown / plain text / scraped HTML) into
// safe HTML used to *seed the editor*. Highlighting is NOT applied here — it happens
// at serialize time (see editor/serialize.ts) so it survives editing. Sanitization is
// shared by the seed path and the final serialize path.

import { Marked } from "marked";
import createDOMPurify from "dompurify";
import type { InputType } from "./types";

const marked = new Marked({ gfm: true, breaks: false });

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Plain text -> paragraphs (blank line = new <p>, single newline = <br>). */
function renderPlainText(input: string): string {
  return input
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br>")}</p>`)
    .join("\n");
}

// Tags that would break the offline / self-contained guarantee or are XSS vectors.
const FORBID_TAGS = [
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "video",
  "audio",
  "svg",
  "math",
  "link",
  "source",
  "picture",
  "base",
];

/**
 * DOMPurify needs a DOM. In the browser and in jsdom (tests) `window` exists; we
 * create the purifier lazily and register a hook that constrains <img src> to
 * `data:` URIs only — this is what keeps the output fully self-contained while still
 * allowing inlined (base64) images.
 */
let purifier: ReturnType<typeof createDOMPurify> | null = null;
function getPurifier() {
  if (!purifier) {
    purifier = createDOMPurify(window as unknown as Window & typeof globalThis);
    purifier.addHook("afterSanitizeAttributes", (node) => {
      if (node.tagName === "IMG") {
        const src = node.getAttribute("src") ?? "";
        if (!src.startsWith("data:")) node.removeAttribute("src");
      }
    });
  }
  return purifier;
}

/** Sanitize untrusted HTML for both seeding and final output. */
export function sanitize(html: string): string {
  return getPurifier().sanitize(html, {
    FORBID_TAGS,
    // Allow the structural/interactive tags our blocks rely on, plus data-* / aria.
    ADD_TAGS: ["details", "summary", "section", "aside", "figure", "figcaption", "button"],
    ADD_ATTR: ["role", "hidden", "open", "data-variant", "data-tabs"],
    ALLOW_DATA_ATTR: true,
  });
}

/**
 * Render raw input of the given type into safe HTML ready to seed the editor.
 * Markdown is parsed (code blocks left un-highlighted); plain text is escaped/
 * paragraphed; scraped HTML is passed through sanitization.
 */
export function render(input: string, type: InputType): string {
  let html: string;
  switch (type) {
    case "markdown":
      html = marked.parse(input, { async: false }) as string;
      break;
    case "text":
      html = renderPlainText(input);
      break;
    case "html":
      html = input;
      break;
  }
  return sanitize(html);
}
