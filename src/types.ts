import type pino from "pino";
import type { PinoLogger } from "./logger";

declare module "hono" {
  export interface ContextVariableMap {
    logger: PinoLogger;
  }
}

export interface LoggerContext {
  Variables: {
    logger: pino.Logger;
  };
}
