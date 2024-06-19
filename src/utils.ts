import type { Context } from "hono";
import { PinoLogger } from "./logger";

export function getLogger(ctx: Context): PinoLogger {
  return ctx.get("logger");
}
