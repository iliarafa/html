// Scraper route: fetch a public URL server-side, extract the readable article with
// @mozilla/readability, and INLINE its images as base64 data URIs (so the downloaded
// file stays self-contained / offline). Hardened against SSRF (page + each image
// host), timeouts, and oversized responses, with per-image / total / count caps.

import { NextResponse } from "next/server";
import { parseHTML } from "linkedom";
import { Readability } from "@mozilla/readability";

export const runtime = "nodejs";

const FETCH_TIMEOUT_MS = 10_000;
const IMG_TIMEOUT_MS = 8_000;
const MAX_BYTES = 5_000_000; // 5 MB page
const IMG = { MAX_COUNT: 15, PER_IMAGE_BYTES: 1_000_000, TOTAL_BYTES: 4_000_000 };
// Non-image media that must be removed regardless.
const STRIP_SELECTOR =
  "script, style, iframe, object, embed, noscript, link, svg, video, audio, source";

/** Reject hosts that could reach internal/metadata services (basic SSRF guard). */
export function isBlockedHost(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, ""); // strip IPv6 brackets
  if (h === "localhost" || h.endsWith(".local") || h.endsWith(".internal")) return true;
  if (h === "0.0.0.0" || h === "::1" || h === "::") return true;
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) {
    const [a, b] = [Number(m[1]), Number(m[2])];
    if (a === 127 || a === 10 || a === 0) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 169 && b === 254) return true; // link-local + cloud metadata
  }
  if (h.startsWith("fc") || h.startsWith("fd") || h.startsWith("fe80")) return true;
  return false;
}

/** Only raster images; svg is an XSS vector and is excluded. */
export function imageMimeAllowed(mime: string): boolean {
  return mime.startsWith("image/") && mime !== "image/svg+xml";
}

function bad(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function fetchWithTimeout(url: URL, ms: number, accept: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        Accept: accept,
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Replace each <img> src with a base64 data URI, or remove the image if it can't be
 * safely inlined (bad host, non-image, over caps). Mutates the document in place.
 */
async function inlineImages(
  doc: { querySelectorAll: (s: string) => Iterable<Element> },
  baseUrl: URL,
): Promise<void> {
  // Unwrap <picture> to its <img>, then drop non-image media.
  for (const pic of Array.from(doc.querySelectorAll("picture"))) {
    const img = pic.querySelector("img");
    if (img) pic.replaceWith(img);
    else pic.remove();
  }
  for (const el of Array.from(doc.querySelectorAll(STRIP_SELECTOR))) el.remove();

  let total = 0;
  let count = 0;
  for (const img of Array.from(doc.querySelectorAll("img"))) {
    const drop = () => img.remove();
    if (count >= IMG.MAX_COUNT) {
      drop();
      continue;
    }
    const src = img.getAttribute("src");
    if (!src) {
      drop();
      continue;
    }
    let imgUrl: URL;
    try {
      imgUrl = new URL(src, baseUrl);
    } catch {
      drop();
      continue;
    }
    if (
      (imgUrl.protocol !== "http:" && imgUrl.protocol !== "https:") ||
      isBlockedHost(imgUrl.hostname)
    ) {
      drop();
      continue;
    }
    try {
      const r = await fetchWithTimeout(imgUrl, IMG_TIMEOUT_MS, "image/*");
      if (!r.ok) {
        drop();
        continue;
      }
      const mime = (r.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
      if (!imageMimeAllowed(mime)) {
        drop();
        continue;
      }
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length > IMG.PER_IMAGE_BYTES || total + buf.length > IMG.TOTAL_BYTES) {
        drop();
        continue;
      }
      img.setAttribute("src", `data:${mime};base64,${buf.toString("base64")}`);
      img.removeAttribute("srcset");
      img.removeAttribute("loading");
      total += buf.length;
      count += 1;
    } catch {
      drop();
    }
  }
}

export async function POST(req: Request) {
  let rawUrl: string;
  try {
    const body = await req.json();
    rawUrl = String(body?.url ?? "").trim();
  } catch {
    return bad("Invalid request body.", 400);
  }
  if (!rawUrl) return bad("Please provide a URL.", 400);

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return bad("That doesn't look like a valid URL.", 400);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return bad("Only http(s) links are supported.", 400);
  }
  if (isBlockedHost(url.hostname)) {
    return bad("That host isn't allowed.", 400);
  }

  let res: Response;
  try {
    res = await fetchWithTimeout(url, FETCH_TIMEOUT_MS, "text/html,application/xhtml+xml");
  } catch (e) {
    return bad(
      (e as Error)?.name === "AbortError"
        ? "The page took too long to respond."
        : "Couldn't reach that URL.",
      502,
    );
  }

  if (!res.ok) return bad(`The page returned ${res.status}.`, 502);
  if (!(res.headers.get("content-type") ?? "").includes("html")) {
    return bad("That link isn't an HTML page.", 415);
  }
  const declaredLength = Number(res.headers.get("content-length") ?? 0);
  if (declaredLength && declaredLength > MAX_BYTES) {
    return bad("That page is too large to scrape.", 413);
  }
  const raw = await res.text();
  if (raw.length > MAX_BYTES) return bad("That page is too large to scrape.", 413);

  let article: { title?: string | null; byline?: string | null; content?: string | null } | null;
  try {
    const { document } = parseHTML(raw);
    article = new Readability(document as unknown as Document).parse();
  } catch {
    return bad("Couldn't parse that page.", 422);
  }
  if (!article || !article.content) {
    return bad("Couldn't find readable content on that page.", 422);
  }

  // Inline images (base64) and strip non-image media so the output is self-contained.
  const { document: contentDoc } = parseHTML(
    `<!DOCTYPE html><html><body>${article.content}</body></html>`,
  );
  await inlineImages(
    contentDoc as unknown as { querySelectorAll: (s: string) => Iterable<Element> },
    url,
  );
  const html = contentDoc.body.innerHTML;

  return NextResponse.json({
    title: article.title ?? "",
    author: article.byline ?? "",
    html,
  });
}
