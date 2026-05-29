import { describe, it, expect } from "vitest";
import { buildDocument, readingMinutes } from "./builder";
import type { BuildOptions } from "./types";

const base: BuildOptions = {
  contentHtml: "<h2>Section</h2><p>Hello world body text.</p>",
  title: "My Notes",
  subtitle: "A subtitle",
  author: "Ilias",
  date: "May 29, 2026",
  theme: { mode: "light", scheme: "indigo", font: "modern", density: "comfortable" },
  template: "article",
  extras: { themeToggle: true, readingTime: true, printStyles: true },
  usesTabs: false,
  headings: [{ id: "section", text: "Section", level: 2 }],
};

describe("builder", () => {
  it("produces a complete, self-contained HTML document", () => {
    const doc = buildDocument(base);
    expect(doc.startsWith("<!DOCTYPE html>")).toBe(true);
    expect(doc).toContain("<title>My Notes</title>");
    expect(doc).toContain('data-theme="light"');
    expect(doc).toContain("<style>");
    expect(doc).not.toContain("<link");
    expect(doc).toContain(base.contentHtml);
  });

  it("renders the header metadata line", () => {
    const doc = buildDocument(base);
    expect(doc).toContain("A subtitle");
    expect(doc).toContain("Ilias");
    expect(doc).toContain("May 29, 2026");
    expect(doc).toContain("min read");
  });

  it("offline guarantee: no external resource URLs, but data: images allowed", () => {
    const doc = buildDocument({
      ...base,
      contentHtml: '<figure class="figure"><img src="data:image/png;base64,AAAA" alt="x"></figure>',
    });
    // base64 images are fine and present
    expect(doc).toContain('src="data:image/png;base64,AAAA"');
    // but never a remote resource
    expect(doc).not.toMatch(/src=["']https?:/);
    expect(doc).not.toMatch(/href=["']https?:[^"']*\.(css)/);
    expect(doc).not.toMatch(/<link\b/);
    expect(doc).not.toMatch(/@import/);
  });

  it("inlines the tabs script only when content uses tabs", () => {
    expect(buildDocument({ ...base, usesTabs: false })).not.toContain("data-tabs");
    const withTabs = buildDocument({ ...base, usesTabs: true });
    expect(withTabs).toContain("querySelectorAll('.tabs[data-tabs]')");
  });

  it("toggle button + script only when enabled", () => {
    expect(buildDocument(base)).toContain('<button class="theme-toggle"');
    const off = buildDocument({
      ...base,
      extras: { themeToggle: false, readingTime: false, printStyles: false },
    });
    expect(off).not.toContain('<button class="theme-toggle"');
    expect(off).not.toContain("min read");
    expect(off).not.toContain("@media print");
  });

  it("applies the chosen template skeleton", () => {
    expect(buildDocument({ ...base, template: "article" })).toContain('class="page"');
    const docs = buildDocument({ ...base, template: "documentation" });
    expect(docs).toContain("doc-shell");
    expect(docs).toContain("doc-toc"); // TOC nav from headings
    expect(docs).toContain('href="#section"');
    expect(buildDocument({ ...base, template: "gallery" })).toContain("gallery");
    expect(buildDocument({ ...base, template: "letter" })).toContain('class="letter"');
  });

  it("composes font + density vars from the theme", () => {
    const doc = buildDocument({
      ...base,
      theme: { mode: "dark", scheme: "teal", font: "editorial", density: "compact" },
    });
    expect(doc).toContain('data-theme="dark"');
    expect(doc).toContain("Iowan Old Style");
    expect(doc).toContain("--base-size: 15px");
    expect(doc).toContain("#2dd4bf"); // teal dark accent
  });

  it("estimates reading time", () => {
    expect(readingMinutes("<p>one two three</p>")).toBe(1);
    expect(readingMinutes("<p>" + "word ".repeat(600) + "</p>")).toBe(3);
  });
});
