// Parser: turns raw input (markdown / plain text / scraped HTML) into safe,
// rendered HTML with code blocks highlighted at generation time.

import { Marked } from "marked";
import hljs from "highlight.js";
import createDOMPurify from "dompurify";
import type { InputType } from "./types";

// A Marked instance with a custom code renderer that pre-applies highlight.js,
// so the output file ships with highlighted markup and needs no runtime JS/CSS
// beyond the inlined theme.
const marked = new Marked({
  gfm: true,
  breaks: false,
});

marked.use({
  renderer: {
    code({ text, lang }: { text: string; lang?: string }): string {
      const language = lang && hljs.getLanguage(lang) ? lang : undefined;
      const highlighted = language
        ? hljs.highlight(text, { language }).value
        : hljs.highlightAuto(text).value;
      const cls = language ? ` language-${language}` : "";
      return `<pre><code class="hljs${cls}">${highlighted}</code></pre>`;
    },
  },
});

/** Escape HTML-special characters in a plain-text string. */
function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Plain text -> paragraphs (blank line = new <p>, single newline = <br>). */
function renderPlainText(input: string): string {
  const blocks = input.replace(/\r\n/g, "\n").split(/\n{2,}/);
  return blocks
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br>")}</p>`)
    .join("\n");
}

/**
 * DOMPurify needs a DOM. In the browser and in jsdom (tests) `window` exists;
 * we create the purifier lazily so this module is import-safe on the server.
 */
let purifier: ReturnType<typeof createDOMPurify> | null = null;
function getPurifier() {
  if (!purifier) {
    purifier = createDOMPurify(window as unknown as Window & typeof globalThis);
  }
  return purifier;
}

/** Sanitize untrusted HTML, keeping class attributes (needed for hljs styling). */
export function sanitize(html: string): string {
  return getPurifier().sanitize(html, {
    ADD_ATTR: ["class"],
    // Images are stripped from scraped articles; forbid them and other media
    // here too so the output stays self-contained / offline.
    FORBID_TAGS: ["img", "picture", "source", "video", "audio", "iframe"],
  });
}

/**
 * Render raw input of the given type into safe, sanitized HTML ready for the
 * Builder. Markdown is parsed; plain text is escaped/paragraphed; scraped HTML
 * is passed through sanitization only.
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
