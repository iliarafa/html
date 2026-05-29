import { describe, it, expect } from "vitest";
import { render, sanitize } from "./parser";

describe("parser", () => {
  it("renders markdown headings, lists, bold, links", () => {
    const html = render(
      "# Title\n\nSome **bold** and a [link](https://example.com).\n\n- a\n- b",
      "markdown",
    );
    expect(html).toContain("<h1");
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain("<li>a</li>");
  });

  it("highlights fenced code blocks at generation time", () => {
    const html = render("```js\nconst x = 1;\n```", "markdown");
    expect(html).toContain("hljs");
    // highlight.js wraps tokens in spans with class names
    expect(html).toMatch(/<span class="hljs-/);
  });

  it("preserves plain text with paragraph and line breaks", () => {
    const html = render("line one\nline two\n\nsecond para", "text");
    expect(html).toContain("line one<br>line two");
    expect(html).toContain("<p>second para</p>");
    // angle brackets in plain text are escaped, not interpreted
    expect(render("a < b > c", "text")).toContain("a &lt; b &gt; c");
  });

  it("strips scripts and event handlers from any input", () => {
    const md = render("<script>alert(1)</script>\n\nhi", "markdown");
    expect(md).not.toContain("<script");
    const html = sanitize('<p onerror="x()" onclick="y()">text</p>');
    expect(html).not.toContain("onerror");
    expect(html).not.toContain("onclick");
  });

  it("strips images and media (self-contained output)", () => {
    const html = sanitize(
      '<p>hi</p><img src="https://x/y.png"><iframe src="https://x"></iframe>',
    );
    expect(html).not.toContain("<img");
    expect(html).not.toContain("<iframe");
    expect(html).toContain("<p>hi</p>");
  });

  it("passes scraped HTML through sanitization", () => {
    const html = render(
      '<h2>Article</h2><p>Body text</p><script>bad()</script>',
      "html",
    );
    expect(html).toContain("<h2>Article</h2>");
    expect(html).toContain("<p>Body text</p>");
    expect(html).not.toContain("<script");
  });
});
