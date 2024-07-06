import type { Context } from "hono";
import { PinoLogger } from "./logger";
import { pino } from "pino";

export function getLogger(c: Context): PinoLogger {
  return c.get("logger");
}

export function isPinoLogger(value: unknown): value is pino.Logger {
  return (
    typeof value === "object" &&
    value !== null &&
    "child" in value &&
    typeof value.child === "function"
  );
}
