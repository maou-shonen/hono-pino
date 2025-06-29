import { describe, expect, it } from "vitest";
import { ANSI,  addStatusColor, isUnixTime } from "./utils";

describe("isUnixTime", () => {
  it("should return true for unix timestamps (seconds)", () => {
    // 2023-01-01T00:00:00Z in seconds
    expect(isUnixTime(1672531200)).toBe(true);

    // 1970-01-01T00:00:00Z (epoch)
    expect(isUnixTime(0)).toBe(true);

    // 2100-01-01T00:00:00Z (upper limit)
    expect(isUnixTime(4102444800)).toBe(true);
  });

  it("should return false for JavaScript timestamps (milliseconds)", () => {
    // 2025-01-01T00:00:00Z in milliseconds
    expect(isUnixTime(1735708800000)).toBe(false);

    // Current time in milliseconds
    expect(isUnixTime(Date.now())).toBe(false);
  });
});

describe("Color utility functions", () => {
  describe("addStatusColor", () => {
    it("should add green color for 2xx status codes", () => {
      const status200 = addStatusColor("200", 200, { colorEnabled: true });
      expect(status200).toBe(`${ANSI.FgGreen}200${ANSI.Reset}`);
      const status201 = addStatusColor("201", 201, { colorEnabled: true });
      expect(status201).toBe(`${ANSI.FgGreen}201${ANSI.Reset}`);
    });

    it("should add cyan color for 3xx status codes", () => {
      const status301 = addStatusColor("301", 301, { colorEnabled: true });
      expect(status301).toBe(`${ANSI.FgCyan}301${ANSI.Reset}`);
      const status304 = addStatusColor("304", 304, { colorEnabled: true });
      expect(status304).toBe(`${ANSI.FgCyan}304${ANSI.Reset}`);
    });

    it("should add yellow color for 4xx status codes", () => {
      const status404 = addStatusColor("404", 404, { colorEnabled: true });
      expect(status404).toBe(`${ANSI.FgYellow}404${ANSI.Reset}`);
      const status403 = addStatusColor("403", 403, { colorEnabled: true });
      expect(status403).toBe(`${ANSI.FgYellow}403${ANSI.Reset}`);
    });

    it("should add red color for 5xx status codes", () => {
      const status500 = addStatusColor("500", 500, { colorEnabled: true });
      expect(status500).toBe(`${ANSI.FgRed}500${ANSI.Reset}`);
      const status503 = addStatusColor("503", 503, { colorEnabled: true });
      expect(status503).toBe(`${ANSI.FgRed}503${ANSI.Reset}`);
    });

    it("should return text as is for unknown status codes", () => {
      const status600 = addStatusColor("600", 600, { colorEnabled: true });
      expect(status600).toBe("600");
    });

    it("should not add colors when color is disabled", () => {
      const disabledText = addStatusColor("200", 200, {
        colorEnabled: false,
      });
      expect(disabledText).toBe("200");
    });
  });
});
