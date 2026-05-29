import { describe, it, expect } from "vitest";
import { buildDocument, readingMinutes } from "./builder";
import type { BuildOptions } from "./types";

const base: BuildOptions = {
  contentHtml: "<h2>Section</h2><p>Hello world body text.</p>",
  title: "My Notes",
  subtitle: "A subtitle",
  author: "Ilias",
  date: "May 29, 2026",
  mode: "light",
  accent: "indigo",
  extras: { themeToggle: true, readingTime: true, printStyles: true },
};

describe("builder", () => {
  it("produces a complete, self-contained HTML document", () => {
    const doc = buildDocument(base);
    expect(doc.startsWith("<!DOCTYPE html>")).toBe(true);
    expect(doc).toContain("<title>My Notes</title>");
    expect(doc).toContain('data-theme="light"');
    // CSS is inlined, not linked
    expect(doc).toContain("<style>");
    expect(doc).not.toContain("<link");
    expect(doc).toContain(base.contentHtml);
  });

  it("renders the header metadata line", () => {
    const doc = buildDocument(base);
    expect(doc).toContain("My Notes");
    expect(doc).toContain("A subtitle");
    expect(doc).toContain("Ilias");
    expect(doc).toContain("May 29, 2026");
    expect(doc).toContain("min read");
  });

  it("contains NO external resource URLs (offline-safe)", () => {
    const doc = buildDocument(base);
    expect(doc).not.toMatch(/https?:\/\//);
    expect(doc).not.toMatch(/<link\b/);
    expect(doc).not.toMatch(/src=/);
  });

  it("includes the toggle button + script only when enabled", () => {
    const on = buildDocument(base);
    expect(on).toContain('<button class="theme-toggle"');
    expect(on).toContain("<script>");

    const off = buildDocument({
      ...base,
      extras: { themeToggle: false, readingTime: false, printStyles: false },
    });
    expect(off).not.toContain('<button class="theme-toggle"');
    expect(off).not.toContain("<script>");
    expect(off).not.toContain("min read");
    expect(off).not.toContain("@media print");
  });

  it("escapes HTML in the title to prevent injection", () => {
    const doc = buildDocument({ ...base, title: '<script>x</script>' });
    expect(doc).toContain("&lt;script&gt;");
    expect(doc).not.toContain("<title><script>");
  });

  it("estimates reading time", () => {
    expect(readingMinutes("<p>one two three</p>")).toBe(1);
    const long = "<p>" + "word ".repeat(600) + "</p>";
    expect(readingMinutes(long)).toBe(3);
  });
});
