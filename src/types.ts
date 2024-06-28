import type { PinoLogger } from "./logger";

declare module "hono" {
  export interface ContextVariableMap {
    logger: PinoLogger;
  }
}
