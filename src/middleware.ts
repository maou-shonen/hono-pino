import type { MiddlewareHandler } from "hono";
import { pino } from "pino";
import { defu } from "defu";
import { isPino } from "./utils";
import type { Options } from "./types";
import { PinoLogger } from "./logger";
import type { LiteralString } from "./utils";

/**
 * Pino logger middleware
 */
export const pinoLogger = <ContextKey extends string = "logger">(
  opts?: Options<LiteralString<ContextKey>>,
): MiddlewareHandler<{
  Variables: {
    [key in ContextKey]: PinoLogger;
  };
}> => {
  const rootLogger = isPino(opts?.pino) ? opts.pino : pino(opts?.pino);
  const contextKey = opts?.contextKey ?? ("logger" as ContextKey);

  return async (c, next) => {
    const logger = new PinoLogger(rootLogger);
    c.set(contextKey, logger);

    // disable http logger
    if (opts?.http === false) {
      await next();
      return;
    }

    let bindings = opts?.http?.onReqBindings?.(c) ?? {
      req: {
        url: c.req.path,
        method: c.req.method,
        headers: c.req.header(),
      },
    };

    const referRequestIdKey = (opts?.http?.referRequestIdKey ??
      "requestId") as "requestId";
    if (referRequestIdKey in c.var) {
      bindings.reqId = c.var[referRequestIdKey];
    } else if (opts?.http?.reqId !== false) {
      bindings.reqId = opts?.http?.reqId?.() ?? defaultReqIdGenerator();
    }

    // on request
    if (opts?.http?.onReqMessage) {
      const level = opts.http.onReqLevel?.(c) ?? "info";
      const msg = opts.http.onReqMessage(c);
      logger[level](bindings, msg);
    }

    if (opts?.http?.responseTime ?? true) {
      const startTime = performance.now();
      await next();
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      bindings.responseTime = responseTime;
    } else {
      await next();
    }

    // on response
    if (opts?.http?.onResMessage !== false) {
      const onResBindings = opts?.http?.onResBindings?.(c) ?? {
        res: {
          status: c.res.status,
          headers: c.res.headers,
        },
      };
      bindings = defu(bindings, onResBindings);

      const level =
        logger.resLevel ??
        opts?.http?.onResLevel?.(c) ??
        (c.error ? "error" : "info");
      const msg =
        logger.resMessage ??
        opts?.http?.onResMessage?.(c) ??
        (c.error ? c.error.message : "Request completed");
      logger[level](bindings, msg);
    }
  };
};

/**
 * Pino logger middleware
 * @deprecated Renamed to pinoLogger, will be removed in 1.0.0
 */
export const logger = pinoLogger;

let defaultReqId = 0n;
const defaultReqIdGenerator = () => (defaultReqId += 1n);
