// Relaxed sanitizer for AI-generated pages. Distinct from the strict offline profile
// in parser.ts: it ALLOWS external resources (web fonts via <link>, <style>, external
// images) so AI pages can look great — but it strips anything executable (<script>,
// event handlers, javascript: URLs, <iframe>/<object>/<embed>). With JS removed, the
// shared file runs no code in the receiver's browser.

import createDOMPurify from "dompurify";

let purifier: ReturnType<typeof createDOMPurify> | null = null;
function getPurifier() {
  if (!purifier) {
    purifier = createDOMPurify(window as unknown as Window & typeof globalThis);
  }
  return purifier;
}

/** Sanitize a full AI-generated HTML document, preserving head/style/link. */
export function sanitizeAiHtml(html: string): string {
  const clean = getPurifier().sanitize(html, {
    WHOLE_DOCUMENT: true,
    ADD_TAGS: ["link"],
    ADD_ATTR: ["rel", "href", "crossorigin", "media", "as", "type", "sizes"],
    FORBID_TAGS: ["script", "noscript", "iframe", "object", "embed", "base"],
    // on* handlers and javascript: URLs are removed by DOMPurify defaults.
  }) as string;

  const doc = clean.trim();
  return doc.toLowerCase().startsWith("<!doctype")
    ? doc
    : `<!DOCTYPE html>\n${doc}`;
}
