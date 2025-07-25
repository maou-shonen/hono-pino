import type { Context, Env as HonoEnv } from "hono";
import type { IsAny } from "hono/utils/types";
import type { pino } from "pino";
import type { PinoLogger } from "./logger";

/**
 * pinoLogger options
 */
export interface Options<ContextKey extends string = "logger"> {
  /**
   * custom context key
   * @description context key for hono, Must be set to literal string.
   * @default "logger"
   *
   * @example
   *
   * ### default is "logger"
   * ```ts
   * new Hono()
   *   .use(logger())
   *   .get('/', (c) => {
   *     const logger = c.get("logger");
   *     // or destructuring from c.var
   *     const { logger } = c.var.logger;
   *   });
   * ```
   *
   * @example
   *
   * ### custom logger
   * ```ts
   * new Hono()
   *   .use(logger({ contextKey: "myLogger" as const }))
   *   .get('/', (c) => {
   *     const logger = c.get("myLogger");
   *   });
   * ```
   *
   * @example
   *
   * ### multiple logger
   * ```ts
   * new Hono()
   *   .use(logger({ contextKey: "myLogger1" as const }))
   *   .use(logger({ contextKey: "myLogger2" as const }))
   *   .get('/', (c) => {
   *     const logger1 = c.get("myLogger1");
   *     const logger2 = c.get("myLogger2");
   *   })
   * ```
   */
  contextKey?: ContextKey;

  /**
   * a pino instance or pino options
   *
   * @example
   *
   * ### default
   *
   * ```ts
   * {
   *   pino: (c) => ({
   *     level: env(c).LOG_LEVEL ?? "info",
   *   })
   * }
   * ```
   *
   * @example
   *
   * ### a pino logger instance
   *
   * ```ts
   * {
   *   pino: pino({ level: "info" })
   * }
   * ```
   *
   * @example
   *
   * ### a pino options
   *
   * ```ts
   * {
   *   pino: { level: "info" }
   * }
   * ```
   *
   * @example
   *
   * ### a pino destination
   *
   * ```ts
   * {
   *   pino: pino.destination("path/to/log.json")
   * }
   * ```
   *
   * @example
   *
   * ### dynamic pino logger instance
   *
   * this method creates a complete pino logger for each request,
   * which results in relatively lower performance,
   * if possible, recommended to use `dynamic pino child options`.
   *
   * ```ts
   * {
   *   pino: (c) => pino({ level: c.env.LOG_LEVEL })
   * }
   * ```
   *
   * @example
   *
   * ### dynamic pino child options
   *
   * ```ts
   * {
   *   pino: (c) => ({
   *     level: c.env.LOG_LEVEL
   *   } satisfies pino.ChildLoggerOptions)
   * }
   * ```
   */
  pino?:
    | pino.Logger
    | pino.LoggerOptions
    | pino.DestinationStream
    | ((c: Context) => pino.Logger)
    | ((c: Context) => pino.ChildLoggerOptions);

  /**
   * Specify whether to treat as Node/Bun runtime.
   * - true: Always treat as Node/Bun (do not use getRuntimeKey)
   * - false: Always treat as non-Node/Bun
   * - "auto": Auto-detect (default, will call getRuntimeKey)
   *
   * @default "auto"
   */
  nodeRuntime?: boolean | "auto";

  /**
   * http request log options
   *
   * @description set to false to disable
   */
  http?: false | HttpLoggerOptions;
}

/**
 * http request log options
 */
export type HttpLoggerOptions = {
  /**
   * custom request id
   * @deprecated Changed to use referRequestIdKey. will be removed in 1.0.0
   *
   * @description set to false to disable
   * @default () => n + 1
   *
   * @example
   * // UUID v4
   * () => crypto.randomUUID()
   */
  reqId?: false | (() => string);
  /**
   * refer requestId key in context,
   *
   * When the requestId is detected from the context,
   * it will be included in the HTTP logger output.
   *
   * @example
   *
   * ### default use "requestId"
   *
   * ```ts
   * import { requestId } from 'hono/request-id'
   *
   * const app = new Hono()
   *   .use(requestId())
   *   .use(logger()) // it will use `requestId` from requestId middleware
   * ```
   */
  referRequestIdKey?: string;
  /**
   * custom onRequest bindings
   *
   * @example
   *
   * ### default
   *
   * ```ts
   * (c) => ({
   *   req: {
   *     url: c.req.path,
   *     method: c.req.method,
   *     headers: c.req.header(),
   *   },
   * })
   * ```
   *
   * @example
   *
   * ### less headers
   *
   * ```ts
   * (c) => ({
   *   req: {
   *     url: c.req.path,
   *     method: c.req.method,
   *     headers: _.pickBy(
   *       c.req.header(),
   *       (value, key) => _.startsWith(key, "x-")
   *     ),
   *   }
   * })
   * ```
   */
  onReqBindings?: (c: Context) => pino.Bindings;
  /**
   * custom onRequest level
   *
   * @example
   *
   * ### default
   *
   * ```ts
   * (c) => "info"
   * ```
   */
  onReqLevel?: (c: Context) => pino.Level;
  /**
   * custom onRequest message
   *
   * @example
   *
   * ### disable (default)
   *
   * ```ts
   * (c) => false
   * ```
   *
   * @example
   *
   * ### enable
   *
   * ```ts
   * (c) => "Request received"
   * ```
   *
   * @example
   *
   * ### async function to access request body
   *
   * ```ts
   * async (c) => {
   *   const body = await c.req.raw.clone().text();
   *   return `Request received with body: ${body}`;
   * }
   * ```
   */
  onReqMessage?: false | ((c: Context) => string | Promise<string>);
  /**
   * custom onResponse bindings
   *
   * @example
   *
   * ### default
   *
   * ```ts
   * (c) => ({
   *   res: {
   *     status: c.res.status,
   *     headers: c.res.headers,
   *   },
   * })
   * ```
   */
  onResBindings?: (c: Context) => pino.Bindings;
  /**
   * custom onResponse level
   *
   * @example
   *
   * ### default
   *
   * ```ts
   * (c) => c.error ? "error" : "info"
   * ```
   *
   * @example
   *
   * ### always trace
   *
   * ```ts
   * () => "trace"
   * ```
   *
   * @example
   *
   * ### 4xx=warn, 5xx=error, default=info
   *
   * ```ts
   * (c) => {
   *   if (c.status >= 500) return "error"
   *   if (c.status >= 400) return "warn"
   *   return "info"
   * ```
   */
  onResLevel?: (c: Context) => pino.Level;
  /**
   * custom onResponse message
   *
   * @example
   *
   * ### default
   *
   * ```ts
   * (c) => c.error ? c.error.message : "Request completed"
   * ```
   *
   * @example
   *
   * ### disable
   *
   * ```ts
   * false
   * ```
   *
   * @example
   *
   * ### async function
   *
   * ```ts
   * async (c) => {
   *   // Perform async operations
   *   return "Request completed with async processing";
   * }
   * ```
   */
  onResMessage?: false | ((c: Context) => string | Promise<string>);
  /**
   * adding response time to bindings
   *
   * @default true
   */
  responseTime?: boolean;
};

/**
 * hono-pino default env for hono context
 *
 * @example
 *
 * ### with your middleware
 *
 * ```ts
 * import { createMiddleware } from 'hono/factory'
 * import type { Env } from "hono-pino"
 *
 * const middleware = createMiddleware<Env>(async (c, next) => {
 *   const logger = c.get("logger")
 *   await next()
 * })
 * ```
 *
 * @example
 *
 * ### custom context key
 *
 * ```ts
 * import { Hono } from "hono"
 * import { logger, type Env } from "hono-pino"
 *
 * const app = new Hono<Env<"myLogger">>()
 * app.use(logger({ contextKey: "myLogger" as const }))
 * app.get('/', (c) => {
 *   const logger = c.get("myLogger")
 * })
 * ```
 *
 * @example
 *
 * ### merge with your env.
 *
 * ```ts
 * import { Hono } from "hono"
 * import { type Env as HonoPinoEnv } from "hono-pino"
 *
 * type Env = {
 *   Variables: {
 *     foo: string
 *   }
 * }
 *
 * const app = new Hono<Env & HonoPinoEnv>()
 * ```
 */
export type Env<LoggerKey extends string = "logger"> =
  IsAny<LoggerKey> extends true
    ? // if LoggerKey is any then return any
      any
    : // if LoggerKey like HonoEnv then return HonoEnv
      LoggerKey extends HonoEnv
      ? HonoEnv
      : // else return PinoLogger
        {
          // Bindings: never;
          Variables: {
            [key in LoggerKey]: PinoLogger;
          };
        };
