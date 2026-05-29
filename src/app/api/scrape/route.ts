// Scraper route: fetch a public URL server-side, extract the readable article
// with @mozilla/readability, strip images/media (text-only, self-contained
// output), and return { title, author, html }. Hardened against SSRF, timeouts,
// and oversized responses.

import { NextResponse } from "next/server";
import { parseHTML } from "linkedom";
import { Readability } from "@mozilla/readability";

export const runtime = "nodejs";

const FETCH_TIMEOUT_MS = 10_000;
const MAX_BYTES = 5_000_000; // 5 MB
const MEDIA_SELECTOR =
  "img, picture, source, video, audio, iframe, object, embed, svg, script, style, noscript, link";

/** Reject hosts that could reach internal/metadata services (basic SSRF guard). */
export function isBlockedHost(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, ""); // strip IPv6 brackets
  if (h === "localhost" || h.endsWith(".local") || h.endsWith(".internal")) return true;
  if (h === "0.0.0.0" || h === "::1" || h === "::") return true;
  // IPv4 literals in private / loopback / link-local ranges
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) {
    const [a, b] = [Number(m[1]), Number(m[2])];
    if (a === 127 || a === 10 || a === 0) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 169 && b === 254) return true; // link-local + cloud metadata
  }
  // IPv6 unique-local / link-local
  if (h.startsWith("fc") || h.startsWith("fd") || h.startsWith("fe80")) return true;
  return false;
}

function bad(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
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

  // Fetch with a timeout.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });
  } catch (e) {
    return bad(
      (e as Error)?.name === "AbortError"
        ? "The page took too long to respond."
        : "Couldn't reach that URL.",
      502,
    );
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) return bad(`The page returned ${res.status}.`, 502);
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("html")) {
    return bad("That link isn't an HTML page.", 415);
  }
  const declaredLength = Number(res.headers.get("content-length") ?? 0);
  if (declaredLength && declaredLength > MAX_BYTES) {
    return bad("That page is too large to scrape.", 413);
  }

  const raw = await res.text();
  if (raw.length > MAX_BYTES) return bad("That page is too large to scrape.", 413);

  // Extract the readable article.
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

  // Strip images and other media so the downloaded file stays self-contained.
  const { document: contentDoc } = parseHTML(
    `<!DOCTYPE html><html><body>${article.content}</body></html>`,
  );
  contentDoc.querySelectorAll(MEDIA_SELECTOR).forEach((el) => el.remove());
  const html = contentDoc.body.innerHTML;

  return NextResponse.json({
    title: article.title ?? "",
    author: article.byline ?? "",
    html,
  });
}
