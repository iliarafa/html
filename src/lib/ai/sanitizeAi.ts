// Relaxed sanitizer for AI-generated pages. Distinct from the strict offline profile
// in parser.ts: it ALLOWS external resources (web fonts via <link>, <style>, external
// images) so AI pages can look great — but it strips anything executable (<script>,
// event handlers, javascript: URLs, <iframe>/<object>/<embed>). With JS removed, the
// shared file runs no code in the receiver's browser.
//
// After sanitizing it runs a deterministic cross-browser hardening pass. The live
// preview renders in an iframe whose base is the app's https origin (Chromium engine),
// while the downloaded file opens from file:// in whatever browser the recipient uses.
// Safari/WebKit is the strictest of these, so the pass guarantees the things AI
// "modern" designs routinely miss: -webkit- prefixes for gradient text / frosted glass,
// a charset + viewport meta, and absolute https URLs that survive a file:// base.

import createDOMPurify from "dompurify";

let purifier: ReturnType<typeof createDOMPurify> | null = null;
function getPurifier() {
  if (!purifier) {
    purifier = createDOMPurify(window as unknown as Window & typeof globalThis);
  }
  return purifier;
}

/**
 * Add Safari/WebKit fallbacks to a chunk of CSS. Chrome accepts these properties
 * unprefixed; Safari still needs the prefixed form, so we emit both. The negative
 * lookbehind skips declarations that are already prefixed.
 */
function addWebkitFallbacks(css: string): string {
  return css
    .replace(
      /(?<!-webkit-)background-clip\s*:\s*text/gi,
      "-webkit-background-clip: text; background-clip: text",
    )
    .replace(
      /(?<!-webkit-)backdrop-filter\s*:\s*([^;}]+)/gi,
      (_m, value: string) =>
        `-webkit-backdrop-filter: ${value.trim()}; backdrop-filter: ${value.trim()}`,
    );
}

const STYLE_BLOCK = /(<style[^>]*>)([\s\S]*?)(<\/style>)/gi;
const INLINE_STYLE = /(\sstyle\s*=\s*")([^"]*)(")/gi;

/** Ensure a charset (first, so it lands in the first bytes) + viewport meta exist. */
function ensureMeta(html: string): string {
  const head = html.match(/<head[^>]*>/i);
  if (!head) return html;
  const adds: string[] = [];
  if (!/<meta\s+charset/i.test(html)) adds.unshift('<meta charset="utf-8">');
  if (!/name=["']viewport["']/i.test(html)) {
    adds.push(
      '<meta name="viewport" content="width=device-width, initial-scale=1">',
    );
  }
  if (adds.length === 0) return html;
  return html.replace(head[0], `${head[0]}\n${adds.join("\n")}`);
}

/**
 * Rewrite protocol-relative resource URLs (//host/…) to https://. They resolve
 * against the page origin in the live preview but become file://host/… once the
 * page is saved and opened locally, silently dropping fonts and images.
 */
function absolutizeUrls(html: string): string {
  return html
    .replace(/((?:href|src)\s*=\s*["'])\/\//gi, "$1https://")
    .replace(/(url\(\s*['"]?)\/\//gi, "$1https://");
}

/** Apply the cross-browser hardening pass to a sanitized document. */
function hardenForBrowsers(html: string): string {
  let out = ensureMeta(html);
  out = absolutizeUrls(out);
  out = out.replace(
    STYLE_BLOCK,
    (_m, open, css, close) => `${open}${addWebkitFallbacks(css)}${close}`,
  );
  out = out.replace(
    INLINE_STYLE,
    (_m, pre, css, post) => `${pre}${addWebkitFallbacks(css)}${post}`,
  );
  return out;
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

  const trimmed = clean.trim();
  const doc = trimmed.toLowerCase().startsWith("<!doctype")
    ? trimmed
    : `<!DOCTYPE html>\n${trimmed}`;
  return hardenForBrowsers(doc);
}
