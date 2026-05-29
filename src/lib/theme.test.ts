import { describe, it, expect } from "vitest";
import { buildThemeCss } from "./theme";
import type { ThemeConfig } from "./types";

const base: ThemeConfig = {
  mode: "light",
  scheme: "indigo",
  font: "modern",
  density: "comfortable",
};

describe("theme", () => {
  it("defines both light and dark palettes", () => {
    const css = buildThemeCss(base);
    expect(css).toContain('[data-theme="light"]');
    expect(css).toContain('[data-theme="dark"]');
  });

  it("injects the chosen color scheme into both palettes", () => {
    const css = buildThemeCss({ ...base, scheme: "emerald" });
    expect(css).toContain("#10b981"); // light emerald
    expect(css).toContain("#34d399"); // dark emerald
  });

  it("applies font pairing and density vars", () => {
    const editorial = buildThemeCss({ ...base, font: "editorial", density: "compact" });
    expect(editorial).toContain("--font-heading:");
    expect(editorial).toContain("Iowan Old Style");
    expect(editorial).toContain("--base-size: 15px"); // compact
  });

  it("includes block, tab, and highlight styling", () => {
    const css = buildThemeCss(base);
    expect(css).toContain(".callout");
    expect(css).toContain(".tabs .tab");
    expect(css).toContain(".collapsible");
    expect(css).toContain(".hljs-keyword");
  });

  it("contains no external resource URLs", () => {
    const css = buildThemeCss({ ...base, scheme: "amber" });
    expect(css).not.toMatch(/https?:\/\//);
    expect(css).not.toMatch(/url\(/);
    expect(css).not.toMatch(/@import/);
  });
});
