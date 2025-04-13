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
  it("should format empty bindings correctly", () => {
    expect(defaultBindingsFormat({})).toBe("");
  });

  it("should format simple bindings correctly", () => {
    const bindings = {
      key1: "value1",
      key2: 123,
    };
    expect(defaultBindingsFormat(bindings)).toBe(
      '\n  & key1: "value1"\n  & key2: 123',
    );
  });

  it("should format complex bindings correctly", () => {
    const bindings = {
      string: "text",
      number: 42,
      boolean: true,
      object: { nested: "value" },
      array: [1, 2, 3],
    };
    expect(defaultBindingsFormat(bindings)).toBe(
      '\n  & string: "text"' +
        "\n  & number: 42" +
        "\n  & boolean: true" +
        '\n  & object: {"nested":"value"}' +
        "\n  & array: [1,2,3]",
    );
  });
});
