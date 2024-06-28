import type { Context } from "hono";
import { PinoLogger } from "./logger";
import { pino } from "pino";

export function getLogger(ctx: Context): PinoLogger {
  return ctx.get("logger");
}

export function isPinoLogger(value: unknown): value is pino.Logger {
  return (
    typeof value === "object" &&
    value !== null &&
    "child" in value &&
    typeof value.child === "function"
  );
}
