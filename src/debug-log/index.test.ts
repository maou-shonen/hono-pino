import { describe, expect, it } from "vitest";
import debugLogTransport from "./";

describe("debug-log transport", () => {
  it("should create a transport function", () => {
    const transport = debugLogTransport();
    expect(transport).toBeInstanceOf(Promise);
  });
});
