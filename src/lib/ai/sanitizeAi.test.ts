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
