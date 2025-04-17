import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as formatter from "./formatter";
import { createHandler } from "./handler";
import * as utils from "./utils";

describe("createHandler", () => {
  // Mock console.log to capture output
  let logs: string[] = [];
  
  beforeEach(() => {
    logs = [];
    // Mock color functions to return predictable output for testing
    vi.spyOn(utils, "addLogLevelColor").mockImplementation(
      (text) => `COLOR:${text}`,
    );
    vi.spyOn(utils, "addStatusColor").mockImplementation(
      (text) => `STATUS:${text}`,
    );
    vi.spyOn(formatter, "defaultTimeFormatter").mockImplementation((time) =>
      typeof time === "number" ? "12:34:56" : String(time),
    );
    vi.spyOn(formatter, "defaultBindingsFormat").mockImplementation(
      (bindings) =>
        Object.entries(bindings).length ? "\n  & bindings: mocked" : "",
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create a handler function", () => {
    const handler = createHandler();
    expect(handler).toBeInstanceOf(Function);
  });

  it("should handle normal logs with default options", () => {
    const handler = createHandler({
      printer: (...log) => logs.push(...log),
    });
    const logObj = {
      level: 30, // info level
      time: 1617123456789,
      msg: "Test message",
      additionalField: "value",
    };

    handler(logObj);

    expect(logs).toHaveLength(2);
    expect(logs[0]).toContain("[12:34:56]");
    expect(logs[0]).toContain("COLOR:INFO");
    expect(logs[0]).toContain("Test message");
    expect(logs[1]).toContain("bindings: mocked");
  });
});
