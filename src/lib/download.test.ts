import { describe, it, expect } from "vitest";
import { slugify } from "./download";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("My Great Notes")).toBe("my-great-notes");
  });
  it("strips punctuation and collapses separators", () => {
    expect(slugify("Hello,  World! -- v2")).toBe("hello-world-v2");
  });
  it("falls back to 'note' when empty", () => {
    expect(slugify("   ")).toBe("note");
    expect(slugify("!!!")).toBe("note");
  });
});
