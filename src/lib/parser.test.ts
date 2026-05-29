import { describe, it, expect } from "vitest";
import { render, sanitize } from "./parser";

describe("parser / sanitizer", () => {
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

  it("leaves code blocks un-highlighted (highlighting happens at serialize time)", () => {
    const html = render("```js\nconst x = 1;\n```", "markdown");
    expect(html).toContain("<pre><code");
    expect(html).toContain("language-js");
    expect(html).not.toMatch(/<span class="hljs-/);
  });

  it("preserves plain text with paragraph and line breaks, escaping angle brackets", () => {
    const html = render("line one\nline two\n\nsecond para", "text");
    expect(html).toContain("line one<br>line two");
    expect(html).toContain("<p>second para</p>");
    expect(render("a < b > c", "text")).toContain("a &lt; b &gt; c");
  });

  it("strips scripts and event handlers", () => {
    expect(render("<script>alert(1)</script>\n\nhi", "markdown")).not.toContain("<script");
    const html = sanitize('<p onerror="x()" onclick="y()">text</p>');
    expect(html).not.toContain("onerror");
    expect(html).not.toContain("onclick");
  });

  it("keeps data: images but drops remote-URL images (offline guarantee)", () => {
    const html = sanitize(
      '<img src="data:image/png;base64,AAAA" alt="ok"><img src="https://x/y.png" alt="no">',
    );
    expect(html).toContain('src="data:image/png;base64,AAAA"');
    expect(html).not.toContain("https://x/y.png");
  });

  it("forbids svg, iframe, and other unsafe/non-offline tags", () => {
    const html = sanitize('<p>hi</p><svg onload="x"></svg><iframe src="https://x"></iframe>');
    expect(html).not.toContain("<svg");
    expect(html).not.toContain("<iframe");
    expect(html).toContain("<p>hi</p>");
  });

  it("preserves block/interactive structure (details, aside, figure, tabs)", () => {
    const input =
      '<details class="collapsible"><summary>More</summary><div class="collapsible-body"><p>x</p></div></details>' +
      '<aside class="callout" data-variant="info"><p>note</p></aside>' +
      '<div class="tabs" data-tabs><div class="tablist" role="tablist"><button class="tab" role="tab" aria-selected="true">A</button></div></div>';
    const html = sanitize(input);
    expect(html).toContain("<details");
    expect(html).toContain("<summary>More</summary>");
    expect(html).toContain('data-variant="info"');
    expect(html).toContain('role="tablist"');
    expect(html).toContain('aria-selected="true"');
  });
});
