import { createMiddleware } from "hono/factory";
import { pino } from "pino";
import deepmerge from "deepmerge";
import { isPinoLogger } from "./utils";
import type { Options } from "./types";
import { PinoLogger } from "./logger";

/**
 * Pino logger middleware
 */
export const logger = (opts?: Options) => {
  const rootLogger = isPinoLogger(opts?.pino) ? opts.pino : pino(opts?.pino);

  return createMiddleware(async (c, next) => {
    const logger = new PinoLogger(rootLogger);
    c.set("logger", logger);

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

    if (opts?.http?.reqId !== false) {
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
      bindings = deepmerge(bindings, onResBindings);

      const level = opts?.http?.onResLevel?.(c) ?? (c.error ? "error" : "info");
      const msg =
        opts?.http?.onResMessage?.(c) ??
        (c.error ? c.error.message : "Request completed");
      logger[level](bindings, msg);
    }
  });
};

let defaultReqId = 0n;
const defaultReqIdGenerator = () => (defaultReqId += 1n);
