import { Transform } from "node:stream";
import { pino } from "pino";
import { describe, expect, it, vi } from "vitest";
import debugLogTransport from "./";

describe("debug-log transport", () => {
  it("should create a transport function", async () => {
    const transport = await debugLogTransport();
    expect(transport).toBeDefined();
  });

  it("should create a transport function", async () => {
    const handler = vi.fn((v) => v);
    const transport = await debugLogTransport({ _handler: handler });
    const logger = pino(
      {
        base: null,
      },
      transport,
    );

    logger.info("hi");

    expect(transport).toBeInstanceOf(Transform);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({
      level: 30,
      time: expect.any(Number),
      msg: "hi",
    });
  });
});
