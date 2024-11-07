import type { Context } from "hono";
import { PinoLogger } from "./logger";
import { pino } from "pino";

/**
 * get logger from context
 * @deprecated Please change to use `c.get("logger")`. will be removed in 1.0.0
 */
export function getLogger(c: Context): PinoLogger {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return c.get("logger");
}

export function isPino(value: unknown): value is pino.Logger {
  return (
    typeof value === "object" &&
    value !== null &&
    // issue: https://github.com/pinojs/pino/issues/2079
    // pino.symbols.messageKeySym in value
    "info" in value &&
    typeof value.info === "function" &&
    "child" in value &&
    typeof value.child === "function"
  );
}

/**
 * T must be literal string
 */
export type LiteralString<T> = T extends string
  ? string extends T
    ? never
    : T
  : never;
