import { describe, it, expect } from "vitest";
import { serializeContent } from "./serialize";

describe("serializeContent", () => {
  it("highlights code blocks at serialize time", () => {
    const { html } = serializeContent(
      '<pre><code class="language-js">const x = 1;</code></pre>',
    );
    expect(html).toContain("hljs");
    expect(html).toMatch(/<span class="hljs-/);
  });

  it("slugs headings and returns a TOC", () => {
    const { html, headings } = serializeContent(
      "<h2>First Section</h2><p>x</p><h3>Sub Section</h3><h2>First Section</h2>",
    );
    expect(headings).toEqual([
      { id: "first-section", text: "First Section", level: 2 },
      { id: "sub-section", text: "Sub Section", level: 3 },
      { id: "first-section-2", text: "First Section", level: 2 },
    ]);
    expect(html).toContain('id="first-section"');
    expect(html).toContain('id="first-section-2"'); // de-duped
  });

  it("expands tab panels into final interactive markup", () => {
    const editorHtml =
      '<div class="tabs" data-tabs>' +
      '<section class="tabpanel" data-label="One"><p>a</p></section>' +
      '<section class="tabpanel" data-label="Two"><p>b</p></section>' +
      "</div>";
    const { html, usesTabs } = serializeContent(editorHtml);
    expect(usesTabs).toBe(true);
    expect(html).toContain('role="tablist"');
    expect(html).toContain('<button class="tab" type="button" role="tab" aria-selected="true">One</button>');
    expect(html).toContain('aria-selected="false"');
    // second panel hidden by default
    expect(html).toMatch(/<section[^>]*hidden[^>]*aria-label="Two"|<section[^>]*aria-label="Two"[^>]*hidden/);
  });

  it("reports usesTabs=false when there are no tabs", () => {
    expect(serializeContent("<p>hi</p>").usesTabs).toBe(false);
  });

  it("preserves callout / collapsible / figure blocks and data: images", () => {
    const editorHtml =
      '<aside class="callout" data-variant="warn"><p>careful</p></aside>' +
      '<details class="collapsible"><summary>More</summary><div class="collapsible-body"><p>x</p></div></details>' +
      '<figure class="figure"><img src="data:image/png;base64,AAAA" alt="i"><figcaption>cap</figcaption></figure>';
    const { html } = serializeContent(editorHtml);
    expect(html).toContain('data-variant="warn"');
    expect(html).toContain("<details");
    expect(html).toContain('src="data:image/png;base64,AAAA"');
    expect(html).toContain("<figcaption>cap</figcaption>");
  });
});
