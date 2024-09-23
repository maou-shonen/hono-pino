import type { Context } from "hono";
import { pino } from "pino";
import type { PinoLogger } from "./logger";

export interface Options<ContextKey extends string = "logger"> {
  /**
   * custom context key
   * @description context key for hono, Must be set to literal string.
   * @default "logger"
   * @example
   *
   * // default
   * new Hono()
   *   .use(logger())
   *   .get('/', (c) => {
   *     const logger = c.get("logger");
   *     // or use c.var
   *     const logger2 = c.var.logger;
   *   });
   *
   * // custom logger
   * new Hono()
   *   .use(logger({ contextKey: "myLogger" as const }))
   *   .get('/', (c) => {
   *     const logger = c.get("myLogger");
   *   });
   *
   * // multiple logger
   * new Hono()
   *   .use(logger({ contextKey: "myLogger1" as const }))
   *   .use(logger({ contextKey: "myLogger2" as const }))
   *   .get('/', (c) => {
   *     const logger1 = c.get("myLogger1");
   *     const logger2 = c.get("myLogger2");
   *   })
   *
   */
  contextKey?: ContextKey;

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

/**
 * hono-pino default env for hono
 * @example
 * // your middleware
 * import { createMiddleware } from 'hono/factory'
 * import type { Env } from "hono-pino"
 *
 * const middleware = createMiddleware<Env>(async (c, next) => {
 *   const logger = c.get("logger")
 *   await next()
 * })
 *
 * // multi-step app
 * import { Hono } from "hono"
 * import { logger, type Env } from "hono-pino"
 *
 * const app = new Hono<Env>()
 * app.use(logger)
 * app.get('/', (c) => {
 *   const logger = c.get("logger")
 * })
 *
 * // custom context key
 * import { Hono } from "hono"
 * import { logger, type Env } from "hono-pino"
 *
 * const app = new Hono<Env<"myLogger">>()
 * app.use(logger({ contextKey: "myLogger" as const }))
 * app.get('/', (c) => {
 *   const logger = c.get("myLogger")
 * })
 *
 * // merge with your env.
 * import { Hono } from "hono"
 * import { type Env as HonoPinoEnv } from "hono-pino"
 *
 * type Env = {
 *   foo: "bar"
 * } & HonoPinoEnv
 *
 * const app = new Hono<Env>()
 */
export type Env<LoggerKey extends string = "logger"> = {
  Variables: {
    [key in LoggerKey]: PinoLogger;
  };
};
