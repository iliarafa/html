import { describe, it, expect } from "vitest";
import { isBlockedHost, imageMimeAllowed } from "./route";

describe("isBlockedHost (SSRF guard)", () => {
  it("blocks loopback and localhost", () => {
    expect(isBlockedHost("localhost")).toBe(true);
    expect(isBlockedHost("127.0.0.1")).toBe(true);
    expect(isBlockedHost("::1")).toBe(true);
  });

  it("blocks private ranges and cloud metadata", () => {
    expect(isBlockedHost("10.0.0.5")).toBe(true);
    expect(isBlockedHost("192.168.1.1")).toBe(true);
    expect(isBlockedHost("172.16.0.1")).toBe(true);
    expect(isBlockedHost("169.254.169.254")).toBe(true);
    expect(isBlockedHost("printer.local")).toBe(true);
  });

  it("allows normal public hosts", () => {
    expect(isBlockedHost("example.com")).toBe(false);
    expect(isBlockedHost("en.wikipedia.org")).toBe(false);
    expect(isBlockedHost("8.8.8.8")).toBe(false);
    expect(isBlockedHost("172.15.0.1")).toBe(false); // just outside private range
  });
});

describe("imageMimeAllowed", () => {
  it("allows raster image types", () => {
    expect(imageMimeAllowed("image/png")).toBe(true);
    expect(imageMimeAllowed("image/jpeg")).toBe(true);
    expect(imageMimeAllowed("image/webp")).toBe(true);
  });
  it("rejects svg (XSS) and non-images", () => {
    expect(imageMimeAllowed("image/svg+xml")).toBe(false);
    expect(imageMimeAllowed("text/html")).toBe(false);
    expect(imageMimeAllowed("application/json")).toBe(false);
  });
});
