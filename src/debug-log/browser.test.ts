import { describe, expect, it } from "vitest";
import { debugLog } from "./browser";
import { createHandler } from "./handler"; 

describe("debug-log browser entry", () => {
  it("should export createHandler as debugLog", () => {
    expect(debugLog).toBe(createHandler);
  });
});
