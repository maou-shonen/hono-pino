import { describe, it, expect } from "vitest";
import { ANSI, getLogger, isPino, statusColors } from "./utils";
import { pino } from "pino";
import { PinoLogger } from "./logger";
import { Hono } from "hono";
import { logger } from "./middleware";

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

it("statusColors", () => {
  expect(statusColors(200)).toBe(ANSI.FgGreen);
  expect(statusColors(300)).toBe(ANSI.FgPurple);
  expect(statusColors(400)).toBe(ANSI.FgRed);
  expect(statusColors(500)).toBe(ANSI.FgYellow);
});
