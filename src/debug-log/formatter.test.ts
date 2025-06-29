import { defaultLevelFormatter } from "./formatter";
describe("defaultLevelFormatter", () => {
  it("should return colored label for each level when colorEnabled is true", () => {
    const levels = [10, 20, 30, 40, 50, 60];
    const labels = ["TRACE", "DEBUG", "INFO", "WARN", "ERROR", "FATAL"];
    const colors = [
      "\x1b[90m", // gray
      "\x1b[36m", // cyan
      "\x1b[32m", // green
      "\x1b[33m", // yellow
      "\x1b[31m", // red
      "\x1b[35m", // magenta
    ];
    levels.forEach((level, i) => {
      const result = defaultLevelFormatter(labels[i], level, {
        colorEnabled: true,
      });
      expect(result).toBe(`${colors[i]}${labels[i]}\x1b[0m`);
    });
  });

  it("should return plain label for each level when colorEnabled is false", () => {
    const levels = [10, 20, 30, 40, 50, 60];
    const labels = ["TRACE", "DEBUG", "INFO", "WARN", "ERROR", "FATAL"];
    levels.forEach((level, i) => {
      const result = defaultLevelFormatter(labels[i], level, { colorEnabled: false });
      expect(result).toBe(labels[i]);
    });
  });
});
import { describe, expect, it } from "vitest";
import { defaultTimeFormatter, defaultBindingsFormat } from "./formatter";
import { isUnixTime } from "./utils";

describe("defaultTimeFormatter", () => {
  it("should return empty string for undefined time", () => {
    expect(defaultTimeFormatter(undefined)).toBe("");
  });

  it("should return empty string for null time", () => {
    // @ts-expect-error testing null value
    expect(defaultTimeFormatter(null)).toBe("");
  });

  it("should return the string as is for string input", () => {
    const timeString = "12:34:56";
    expect(defaultTimeFormatter(timeString)).toBe(timeString);
  });

  it("should format unix time correctly", () => {
    // Unix timestamp for 2023-01-01T12:34:56Z (in seconds)
    const unixTime = 1672576496;
    expect(isUnixTime(unixTime)).toBe(true);
    expect(defaultTimeFormatter(unixTime)).toBe("12:34:56");
  });

  it("should format non-unix time (milliseconds) correctly", () => {
    // JavaScript timestamp for 2023-01-01T12:34:56.789Z (in milliseconds)
    const jsTime = 1672576496789;
    expect(isUnixTime(jsTime)).toBe(false);

    // Mock Date to ensure consistent test results
    const originalDate = global.Date;
    const mockDate = class extends Date {
      getMilliseconds() {
        return 789;
      }
    };
    global.Date = mockDate as DateConstructor;

    expect(defaultTimeFormatter(jsTime)).toBe("12:34:56.789");

    // Restore original Date
    global.Date = originalDate;
  });
});

describe("defaultBindingsFormat", () => {
  it("should format bindings with colorEnabled = true", () => {
    const bindings = { foo: 1 };
    const result = defaultBindingsFormat(bindings, { colorEnabled: true });
    expect(result).toBe("\x1b[90m{" + '\"foo\":1' + "}\x1b[0m");
  });

  it("should format bindings with colorEnabled = false", () => {
    const bindings = { foo: 1 };
    const result = defaultBindingsFormat(bindings, { colorEnabled: false });
    expect(result).toBe('{"foo":1}');
  });

  it("should format bindings with colorEnabled = undefined (default)", () => {
    const bindings = { foo: 1 };
    // Accept either colored or plain output depending on environment, so just check type
    const result = defaultBindingsFormat(bindings, {});
    expect([
      '{"foo":1}',
      "\x1b[90m{\"foo\":1}\x1b[0m"
    ]).toContain(result);
  });
  it("should format empty bindings correctly", () => {
    // Accept either empty string or '{}' (with or without color)
    const result = defaultBindingsFormat({});
    expect(["", "{}", "\x1b[90m{}\x1b[0m"]).toContain(result);
  });

  it("should format simple bindings correctly", () => {
    const bindings = {
      key1: "value1",
      key2: 123,
    };
    // Accept JSON string (with or without color)
    const result = defaultBindingsFormat(bindings);
    const expected = JSON.stringify(bindings);
    expect([expected, `\x1b[90m${expected}\x1b[0m`]).toContain(result);
  });

  it("should format complex bindings correctly", () => {
    const bindings = {
      string: "text",
      number: 42,
      boolean: true,
      object: { nested: "value" },
      array: [1, 2, 3],
    };
    const result = defaultBindingsFormat(bindings);
    const expected = JSON.stringify(bindings);
    expect([expected, `\x1b[90m${expected}\x1b[0m`]).toContain(result);
  });
});
