import { describe, it, expect } from "vitest";
import { sanitizeAiHtml } from "./sanitizeAi";
import { stripCodeFences, buildPrompt } from "./prompt";

describe("sanitizeAiHtml", () => {
  const doc = `<!DOCTYPE html><html><head>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter">
<style>body{font-family:Inter}</style>
</head><body>
<h1 onclick="alert(1)">Hi</h1>
<img src="https://images.unsplash.com/photo-1.jpg" alt="x">
<script>alert('xss')</script>
<iframe src="https://evil.example"></iframe>
</body></html>`;

  const out = sanitizeAiHtml(doc);

  it("keeps web fonts, styles, and external images", () => {
    expect(out).toContain('rel="stylesheet"');
    expect(out).toContain("fonts.googleapis.com");
    expect(out).toContain("<style>");
    expect(out).toContain("images.unsplash.com");
  });

  it("strips scripts, iframes, and event handlers", () => {
    expect(out).not.toContain("<script");
    expect(out).not.toContain("<iframe");
    expect(out).not.toContain("onclick");
  });

  it("ensures a doctype prefix", () => {
    expect(out.toLowerCase().startsWith("<!doctype html>")).toBe(true);
  });
});

describe("sanitizeAiHtml cross-browser hardening", () => {
  it("adds a charset and viewport meta when missing", () => {
    const out = sanitizeAiHtml("<html><head></head><body><p>hi</p></body></html>");
    expect(out).toMatch(/<meta charset="utf-8">/i);
    expect(out).toContain('name="viewport"');
  });

  it("does not duplicate an existing charset", () => {
    const out = sanitizeAiHtml(
      '<html><head><meta charset="UTF-8"></head><body>x</body></html>',
    );
    expect(out.match(/<meta charset/gi)?.length).toBe(1);
  });

  it("adds the -webkit- prefix for gradient text in a <style> block", () => {
    const out = sanitizeAiHtml(
      "<html><head><style>h1{background-clip:text;color:transparent}</style></head><body>x</body></html>",
    );
    expect(out).toContain("-webkit-background-clip: text");
    expect(out).toContain("background-clip: text");
  });

  it("does not double-prefix an already-prefixed declaration", () => {
    const out = sanitizeAiHtml(
      "<html><head><style>h1{-webkit-background-clip:text}</style></head><body>x</body></html>",
    );
    expect(out.match(/-webkit-background-clip/gi)?.length).toBe(1);
  });

  it("adds the -webkit- prefix for backdrop-filter", () => {
    const out = sanitizeAiHtml(
      "<html><head><style>.card{backdrop-filter:blur(8px)}</style></head><body>x</body></html>",
    );
    expect(out).toContain("-webkit-backdrop-filter: blur(8px)");
    expect(out).toContain("backdrop-filter: blur(8px)");
  });

  it("rewrites protocol-relative resource URLs to https so they survive file://", () => {
    const out = sanitizeAiHtml(
      '<html><head><link rel="stylesheet" href="//fonts.googleapis.com/css2?family=Inter"></head><body><img src="//images.unsplash.com/p.jpg"></body></html>',
    );
    expect(out).toContain("https://fonts.googleapis.com");
    expect(out).toContain("https://images.unsplash.com");
    expect(out).not.toContain('href="//');
    expect(out).not.toContain('src="//');
  });
});

describe("prompt helpers", () => {
  it("strips markdown code fences", () => {
    expect(stripCodeFences("```html\n<p>hi</p>\n```")).toBe("<p>hi</p>");
    expect(stripCodeFences("<p>hi</p>")).toBe("<p>hi</p>");
  });

  it("builds a generation prompt with brief + content", () => {
    const { system, prompt } = buildPrompt({ content: "My notes", brief: "warm editorial" });
    expect(system).toContain("NEVER output <script>");
    expect(prompt).toContain("warm editorial");
    expect(prompt).toContain("My notes");
  });

  it("builds a refine prompt from previous HTML + instruction", () => {
    const { prompt } = buildPrompt({
      content: "x",
      previousHtml: "<html>old</html>",
      instruction: "bigger hero",
    });
    expect(prompt).toContain("<html>old</html>");
    expect(prompt).toContain("bigger hero");
    expect(prompt).toContain("COMPLETE updated HTML");
  });
});
