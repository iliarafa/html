import { describe, it, expect } from "vitest";
import { fitDimensions, dataUriBytes, MAX_EDGE } from "./process";

describe("fitDimensions", () => {
  it("leaves small images unchanged", () => {
    expect(fitDimensions(800, 600)).toEqual({ width: 800, height: 600 });
  });
  it("scales down to the max edge, preserving aspect ratio", () => {
    expect(fitDimensions(3200, 1600)).toEqual({ width: MAX_EDGE, height: 800 });
    expect(fitDimensions(1000, 4000)).toEqual({ width: 400, height: MAX_EDGE });
  });
});

describe("dataUriBytes", () => {
  it("estimates decoded byte size from a base64 data URI", () => {
    // "AAAA" -> 3 bytes, no padding
    expect(dataUriBytes("data:image/png;base64,AAAA")).toBe(3);
    // "AAA=" -> 2 bytes
    expect(dataUriBytes("data:image/png;base64,AAA=")).toBe(2);
    // "AA==" -> 1 byte
    expect(dataUriBytes("data:image/png;base64,AA==")).toBe(1);
  });
});
