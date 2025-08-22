import { Hono } from "hono";
import pino from "pino";
import { describe, expect, it, vi } from "vitest";
import { PinoLogger } from "./logger";
import { logger } from "./middleware";
import {
  createConsoleDestinationStream,
  getLogger,
  isPino,
  isPinoTransport,
  LiteralString,
} from "./utils";

describe("isPinoLogger", () => {
  it("test pino", () => {
    expect(isPino(pino())).toBe(true);
  });

  it("my PinoLogger", () => {
    expect(isPino(new PinoLogger(pino()))).toBe(false);
  });

  it("built-in types", () => {
    for (const v of [{}, [], 0, "", true, false, null, undefined]) {
      expect(isPino(v)).toBe(false);
    }
  });
});

it("getLogger", async () => {
  const app = await new Hono();
  app.use(logger());
  app.get("/", async (c) => {
    const logger = getLogger(c);
    expect(logger).toBeInstanceOf(PinoLogger);
    return c.text("ok");
  });
  const res = await app.request("/");
  expect(res.status).toBe(200);
  expect(res.text()).resolves.toBe("ok");
});

describe("createConsoleDestinationStream", () => {
  it("should return a destination stream with write method that logs to console", () => {
    const stream = createConsoleDestinationStream();
    expect(typeof stream.write).toBe("function");
    const spy = vi.spyOn(console, "log");
    stream.write("hello world");
    expect(spy).toHaveBeenCalledWith("hello world");
    spy.mockRestore();
  });
});

describe("isPinoTransport", () => {
  it("should return true for a valid DestinationStream", () => {
    const stream = { write: (msg: string) => {} };
    expect(isPinoTransport(stream)).toBe(true);
  });
  it("should return false for invalid values", () => {
    expect(isPinoTransport(null)).toBe(false);
    expect(isPinoTransport(undefined)).toBe(false);
    expect(isPinoTransport({})).toBe(false);
    expect(isPinoTransport({ write: 123 })).toBe(false);
    expect(isPinoTransport({ write: () => {}, foo: 1 })).toBe(true);
    expect(isPinoTransport(123)).toBe(false);
    expect(isPinoTransport("string")).toBe(false);
  });
});
