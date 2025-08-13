import { defu } from "defu";
import type { Context, MiddlewareHandler } from "hono";
import { env, getRuntimeKey } from "hono/adapter";
import { pino } from "pino";
import { httpCfgSym, PinoLogger } from "./logger";
import type { Env, Options } from "./types";
import type { LiteralString } from "./utils";
import {
  createConsoleDestinationStream,
  isPino,
  isPinoTransport,
} from "./utils";

/**
 * hono-pino middleware
 */
export const pinoLogger = <ContextKey extends string = "logger">(
  opts?: Options<LiteralString<ContextKey>>,
): MiddlewareHandler<Env<ContextKey>> => {
  const contextKey = opts?.contextKey ?? ("logger" as ContextKey);
  const nodeRuntime =
    opts?.nodeRuntime === "auto" || opts?.nodeRuntime === undefined
      ? ["node", "bun"].includes(getRuntimeKey())
      : opts?.nodeRuntime;
  let rootLogger = createStaticRootLogger(opts?.pino, nodeRuntime);

  return async (c, next) => {
    const [dynamicRootLogger, loggerChildOptions] = parseDynamicRootLogger(
      opts?.pino,
      c,
    );
    // set rootLogger to 1.static, 2.dynamic 3.default
    rootLogger ??= dynamicRootLogger ?? getDefaultRootLogger();
    const logger = new PinoLogger(rootLogger, loggerChildOptions);
    // @ts-expect-error typescript incorrectly infers the `ContextKey` type to be "requestId"
    c.set(contextKey, logger);

    // disable http logger
    if (opts?.http === false) {
      await next();
      return;
    }

    logger.assign(
      opts?.http?.onReqBindings?.(c) ?? {
        req: {
          url: c.req.path,
          method: c.req.method,
          headers: c.req.header(),
        },
      },
    );

    // Create new set of bindings so `req` is not duplicated in logs
    let bindings = opts?.http?.onReqBindings?.(c) ?? {};

    // requestId
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
      const msg = await opts.http.onReqMessage(c);
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
        logger[httpCfgSym].resLevel ??
        opts?.http?.onResLevel?.(c) ??
        (c.error ? "error" : "info");
      const msg =
        logger[httpCfgSym].resMessage ??
        (opts?.http?.onResMessage
          ? await opts?.http?.onResMessage(c)
          : undefined) ??
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

let _defaultReqId = 0;
const defaultReqIdGenerator = () => {
  _defaultReqId += 1;
  return _defaultReqId;
};

/**
 * create static rootLogger,
 * in dynamic rootLogger mode, is null
 */
export const createStaticRootLogger = (
  opt: Options["pino"],
  nodeRuntime: boolean,
): pino.Logger | null => {
  if (typeof opt === "function") return null; // for dynamic rootLogger
  if (isPino(opt)) return opt;
  if (nodeRuntime) return pino(opt);
  if (isPinoTransport(opt)) return pino(opt);
  return pino(opt ?? {}, createConsoleDestinationStream());
};

/**
 * parse dynamic rootLogger
 *
 * @returns [dynamicRootLogger, loggerChildOptions]
 */
const parseDynamicRootLogger = (
  opt: Options["pino"],
  c: Context,
): [pino.Logger | undefined, pino.ChildLoggerOptions | undefined] => {
  // default
  if (opt === undefined) {
    const { LOG_LEVEL } = env<{ LOG_LEVEL?: string }>(c);
    return [
      undefined,
      {
        level: LOG_LEVEL ?? "info",
      },
    ];
  }

  if (typeof opt !== "function") return [undefined, undefined];
  const v = opt(c);
  if (isPino(v)) return [v, undefined];
  return [undefined, v];
};

let _defaultRootLogger: pino.Logger | undefined;
/**
 * get default rootLogger (lazy initialization)
 */
const getDefaultRootLogger = (): pino.Logger => {
  _defaultRootLogger ??= pino();
  return _defaultRootLogger;
};
