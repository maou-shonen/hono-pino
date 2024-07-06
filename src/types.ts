import type { PinoLogger } from "./logger";
import type { Context } from "hono";
import { pino } from "pino";

declare module "hono" {
  export interface ContextVariableMap {
    logger: PinoLogger;
  }
}

export interface Options {
  /**
   * a pino instance or pino options
   */
  pino?: pino.Logger | pino.LoggerOptions | pino.DestinationStream;

  /**
   * http request log options
   */
  http?:
    | false
    | {
        /**
         * custom request id
         * @description set to false to disable
         * @default () => n + 1
         *
         * @example
         * // UUID v4
         * () => crypto.randomUUID()
         */
        reqId?: false | (() => string);
        /**
         * custom on request bindings
         * @default
         * (c) => ({
         *   req: {
         *     url: c.req.path,
         *     method: c.req.method,
         *     headers: c.req.header(),
         *   },
         * })
         */
        onReqBindings?: (c: Context) => pino.Bindings;
        /**
         * custom on request level
         * @default (c) => "info"
         */
        onReqLevel?: (c: Context) => pino.Level;
        /**
         * custom on request message
         * @description set to false to disable
         * @default false // disable
         *
         * @example
         * (c) => "Request received"
         */
        onReqMessage?: false | ((c: Context) => string);
        /**
         * custom on response bindings
         * @default
         * (c) => ({
         *   res: {
         *     status: c.res.status,
         *     headers: c.res.headers,
         *   },
         * })
         */
        onResBindings?: (c: Context) => pino.Bindings;
        /**
         * custom on response level
         * @default (c) => c.error ? "error" : "info"
         *
         * @example
         * // always trace
         * () => "trace"
         *
         * @example
         * // 4xx=warn, 5xx=error, default=info
         * (c) => {
         *   if (c.status >= 500) return "error"
         *   if (c.status >= 400) return "warn"
         *   return "info"
         */
        onResLevel?: (c: Context) => pino.Level;
        /**
         * custom on response message
         * @description set to false to disable
         * @default (c) => c.error ? c.error.message : "Request completed"
         */
        onResMessage?: false | ((c: Context) => string);
        /**
         * adding response time to bindings
         * @default true
         */
        responseTime?: boolean;
      };
}
