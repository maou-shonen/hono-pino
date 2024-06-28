import { createMiddleware } from "hono/factory";
import type { Context } from "hono";
import { pino } from "pino";
import deepmerge from "deepmerge";

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
         * custom received bindings
         * @default
         * (ctx) => ({
         *   req: {
         *     url: ctx.req.path,
         *     method: ctx.req.method,
         *     headers: ctx.req.header(),
         *   },
         * })
         */
        receivedBindings?: (ctx: Context) => pino.Bindings;
        /**
         * custom received level
         * @default (ctx) => "info"
         */
        receivedLevel?: (ctx: Context) => pino.Level;
        /**
         * custom received message
         * @description set to null to disable
         * @default null // disable
         *
         * @example
         * (ctx) => "Request received"
         */
        receivedMessage?: ((ctx: Context) => string) | null;
        /**
         * custom completed bindings
         * @default
         * (ctx) => ({
         *   res: {
         *     status: ctx.res.status,
         *     headers: ctx.res.headers,
         *   },
         * })
         */
        completedBindings?: (ctx: Context) => pino.Bindings;
        /**
         * custom completed level
         * @default (ctx) => ctx.error ? "error" : "info"
         *
         * @example
         * // always trace
         * () => "trace"
         *
         * @example
         * // 4xx=warn, 5xx=error, default=info
         * (ctx) => {
         *   if (ctx.status >= 500) return "error"
         *   if (ctx.status >= 400) return "warn"
         *   return "info"
         */
        completedLevel?: (ctx: Context) => pino.Level;
        /**
         * custom completed message
         * @description set to null to disable
         * @default (ctx) => ctx.error ? ctx.error.message : "Request completed"
         */
        completedMessage?: ((ctx: Context) => string) | null;
        /**
         * adding response time to bindings
         * @default true
         */
        responseTime?: boolean;
      };
}

export class PinoLogger {
  private rootLogger: pino.Logger;
  logger: pino.Logger;

  constructor(rootLogger: pino.Logger) {
    this.rootLogger = rootLogger.child({});
    this.logger = rootLogger;
  }

  /**
   * assign bindings to http log context
   */
  assign(bindings: pino.Bindings) {
    this.logger = this.rootLogger.child({
      ...this.logger.bindings(),
      ...bindings,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  trace: pino.LogFn = (...args: [any, ...any]) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.logger.trace(...args);
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug: pino.LogFn = (...args: [any, ...any]) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.logger.debug(...args);
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info: pino.LogFn = (...args: [any, ...any]) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.logger.info(...args);
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn: pino.LogFn = (...args: [any, ...any]) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.logger.warn(...args);
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: pino.LogFn = (...args: [any, ...any]) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.logger.error(...args);
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fatal: pino.LogFn = (...args: [any, ...any]) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.logger.fatal(...args);
  };
}

/**
 * Pino logger middleware
 */
export const logger = (opts?: Options) => {
  const rootLogger = isPinoLogger(opts?.pino) ? opts.pino : pino(opts?.pino);

  return createMiddleware(async (ctx, next) => {
    const logger = new PinoLogger(rootLogger);
    ctx.set("logger", logger);

    if (opts?.http) {
      let bindings = opts.http.receivedBindings?.(ctx) ?? {
        req: {
          url: ctx.req.path,
          method: ctx.req.method,
          headers: ctx.req.header(),
        },
      };

      if (opts.http.reqId !== false) {
        bindings.reqId = opts.http.reqId?.() ?? defaultReqIdGenerator();
      }

      if (opts.http.receivedMessage) {
        const level = opts.http.receivedLevel?.(ctx) ?? "info";
        const msg = opts.http.receivedMessage(ctx);
        logger[level](bindings, msg);
      }

      if (opts.http.responseTime ?? true) {
        const startTime = performance.now();
        await next();
        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);
        bindings.responseTime = responseTime;
      } else {
        await next();
      }

      const completedBindings = opts.http.completedBindings?.(ctx) ?? {
        res: {
          status: ctx.res.status,
          headers: ctx.res.headers,
        },
      };
      bindings = deepmerge(bindings, completedBindings);

      const level =
        opts.http.completedLevel?.(ctx) ?? (ctx.error ? "error" : "info");
      const msg =
        opts.http.completedMessage?.(ctx) ??
        (ctx.error ? ctx.error.message : "Request completed");
      logger[level](bindings, msg);
    }

    // disable http logger
    else {
      await next();
    }
  });
};

const isPinoLogger = (value: unknown): value is pino.Logger =>
  typeof value === "object" &&
  value !== null &&
  "child" in value &&
  typeof value.child === "function";

let defaultReqId = 0n;
const defaultReqIdGenerator = () => (defaultReqId += 1n);
