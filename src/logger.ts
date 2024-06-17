import { createMiddleware } from "hono/factory"
import { pino } from "pino"
import { Context } from "hono"
import deepmerge from "deepmerge"

interface Options {
  pino?: pino.Logger | pino.LoggerOptions

  /**
   *
   */
  http?: {
    /**
     * enable / disable http logger
     * @default true
     */
    enable?: boolean
    /**
     * custom request id
     * @description set to null to disable
     * @default () => n + 1
     *
     * @example
     * // UUID v4
     * () => crypto.randomUUID()
     */
    reqId?: (() => string) | null
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
    receivedBindings?: (ctx: Context) => pino.Bindings
    /**
     * custom received level
     * @default (ctx) => "info"
     */
    receivedLevel?: (ctx: Context) => pino.Level
    /**
     * custom received message
     * @description set to null to disable
     * @default null // disable
     *
     * @example
     * (ctx) => "Request received"
     */
    receivedMessage?: ((ctx: Context) => string) | null
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
    completedBindings?: (ctx: Context) => pino.Bindings
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
    completedLevel?: (ctx: Context) => pino.Level
    /**
     * custom completed message
     * @description set to null to disable
     * @default (ctx) => ctx.error ? ctx.error.message : "Request completed"
     */
    completedMessage?: ((ctx: Context) => string) | null
    /**
     * adding response time to bindings
     * @default true
     */
    responseTime?: boolean
  }
}

export class PinoLogger {
  rootLogger: pino.Logger
  logger: pino.Logger

  constructor(rootLogger: pino.Logger) {
    this.rootLogger = rootLogger
    this.logger = rootLogger
  }

  assign(bindings: pino.Bindings) {
    this.logger = this.rootLogger.child({
      ...this.logger.bindings(),
      ...bindings,
    })
  }

  trace: pino.LogFn = (...args: [any, ...any]) => this.logger.trace(...args)
  debug: pino.LogFn = (...args: [any, ...any]) => this.logger.debug(...args)
  info: pino.LogFn = (...args: [any, ...any]) => this.logger.info(...args)
  warn: pino.LogFn = (...args: [any, ...any]) => this.logger.warn(...args)
  error: pino.LogFn = (...args: [any, ...any]) => this.logger.error(...args)
  fatal: pino.LogFn = (...args: [any, ...any]) => this.logger.fatal(...args)
}

/**
 * Pino logger middleware
 */
export const logger = (opts?: Options) => {
  const rootLogger = isPinoLogger(opts?.pino) ? opts.pino : pino(opts?.pino)

  return createMiddleware(async (ctx, next) => {
    const logger = new PinoLogger(rootLogger)
    ctx.set("logger", logger)

    if (opts?.http?.enable ?? true) {
      let bindings = opts?.http?.receivedBindings?.(ctx) ?? {
        req: {
          url: ctx.req.path,
          method: ctx.req.method,
          headers: ctx.req.header(),
        },
      }

      if (opts?.http?.reqId !== null) {
        bindings.reqId = opts?.http?.reqId?.() ?? defaultReqIdGenerator()
      }

      if (opts?.http?.receivedMessage) {
        const level = opts?.http?.receivedLevel?.(ctx) ?? "info"
        const msg = opts?.http?.receivedMessage(ctx)
        logger[level](bindings, msg)
      }

      if (opts?.http?.responseTime ?? true) {
        const startTime = performance.now()
        await next()
        const endTime = performance.now()
        const responseTime = Math.round(endTime - startTime)
        bindings.responseTime = responseTime
        // Object.assign(bindings, { responseTime })
      } else {
        await next()
      }

      const completedBindings = opts?.http?.completedBindings?.(ctx) ?? {
        res: {
          status: ctx.res.status,
          headers: ctx.res.headers,
        },
      }
      // Object.assign(bindings, completedBindings)
      bindings = deepmerge(bindings, completedBindings)

      const level =
        opts?.http?.completedLevel?.(ctx) ?? (ctx.error ? "error" : "info")
      const msg =
        opts?.http?.completedMessage?.(ctx) ??
        (ctx.error ? ctx.error.message : "Request completed")
      logger[level](bindings, msg)
    }

    // disable http logger
    else {
      await next()
    }
  })
}

const isPinoLogger = (value: unknown): value is pino.Logger =>
  typeof value === "object" &&
  value !== null &&
  typeof value["child"] === "function"

let defaultReqId = 0n
const defaultReqIdGenerator = () => (defaultReqId += 1n)
