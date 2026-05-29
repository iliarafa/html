import { describe, it, expect } from "vitest";
import { buildThemeCss } from "./theme";

describe("theme", () => {
  it("defines both light and dark palettes", () => {
    const css = buildThemeCss("indigo");
    expect(css).toContain('[data-theme="light"]');
    expect(css).toContain('[data-theme="dark"]');
  });

  it("injects the chosen accent into both palettes", () => {
    const css = buildThemeCss("emerald");
    expect(css).toContain("#10b981"); // light emerald
    expect(css).toContain("#34d399"); // dark emerald
  });

  it("includes highlight.js token styling", () => {
    const css = buildThemeCss("rose");
    expect(css).toContain(".hljs-keyword");
  });

  it("contains no external resource URLs", () => {
    const css = buildThemeCss("amber");
    expect(css).not.toMatch(/https?:\/\//);
    expect(css).not.toMatch(/url\(/);
  });
});
