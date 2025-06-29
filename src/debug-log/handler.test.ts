import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as formatter from "./formatter";
import { createHandler } from "./handler";
import * as utils from "./utils";

describe("createHandler", () => {
  // Mock console.log to capture output
  let logs: string[] = [];

  beforeEach(() => {
    logs = [];
    vi.spyOn(formatter, "defaultTimeFormatter").mockImplementation((time) =>
      typeof time === "number" ? "12:34:56" : String(time)
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
      colorEnabled: false,
    });

    const logObjWithBindings = {
      level: 30, // info level
      time: 1617123456789,
      msg: "Test message",
      res: { status: 200 },
      req: { method: "GET", url: "/" },
      reqId: "reqId",
      responseTime: 1,
      customNumber: 1,
      customString: "value",
      customBoolean: true,
      customNull: null,
      customElements: [{ a: 1 }],
    };
    handler(logObjWithBindings);
    expect(logs).toHaveLength(1);
    expect(logs[0]).toBe(
      '[12:34:56] reqId GET / 200 (1ms) - Test message {"customNumber":1,"customString":"value","customBoolean":true,"customNull":null,"customElements":[{"a":1}]}'
    );
  });
});
