import { describe, it, expect } from "vitest";
import { isBlockedHost } from "./route";

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
