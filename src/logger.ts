/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import { defu } from "defu";
import { pino } from "pino";

/**
 * hono-pino logger instance
 */
export interface PinoLogger {
  /**
   * Log at `'trace'` level the given msg. If the first argument is an object, all its properties will be included in the JSON line.
   * If more args follows `msg`, these will be used to format `msg` using `util.format`.
   *
   * @typeParam T: the interface of the object being serialized. Default is object.
   * @param obj: object to be serialized
   * @param msg: the log message to write
   * @param ...args: format string values when `msg` is a format string
   */
  trace: pino.LogFn;
  /**
   * Log at `'debug'` level the given msg. If the first argument is an object, all its properties will be included in the JSON line.
   * If more args follows `msg`, these will be used to format `msg` using `util.format`.
   *
   * @typeParam T: the interface of the object being serialized. Default is object.
   * @param obj: object to be serialized
   * @param msg: the log message to write
   * @param ...args: format string values when `msg` is a format string
   */
  debug: pino.LogFn;
  /**
   * Log at `'info'` level the given msg. If the first argument is an object, all its properties will be included in the JSON line.
   * If more args follows `msg`, these will be used to format `msg` using `util.format`.
   *
   * @typeParam T: the interface of the object being serialized. Default is object.
   * @param obj: object to be serialized
   * @param msg: the log message to write
   * @param ...args: format string values when `msg` is a format string
   */
  info: pino.LogFn;
  /**
   * Log at `'warn'` level the given msg. If the first argument is an object, all its properties will be included in the JSON line.
   * If more args follows `msg`, these will be used to format `msg` using `util.format`.
   *
   * @typeParam T: the interface of the object being serialized. Default is object.
   * @param obj: object to be serialized
   * @param msg: the log message to write
   * @param ...args: format string values when `msg` is a format string
   */
  warn: pino.LogFn;
  /**
   * Log at `'error'` level the given msg. If the first argument is an object, all its properties will be included in the JSON line.
   * If more args follows `msg`, these will be used to format `msg` using `util.format`.
   *
   * @typeParam T: the interface of the object being serialized. Default is object.
   * @param obj: object to be serialized
   * @param msg: the log message to write
   * @param ...args: format string values when `msg` is a format string
   */
  error: pino.LogFn;
  /**
   * Log at `'fatal'` level the given msg. If the first argument is an object, all its properties will be included in the JSON line.
   * If more args follows `msg`, these will be used to format `msg` using `util.format`.
   *
   * @typeParam T: the interface of the object being serialized. Default is object.
   * @param obj: object to be serialized
   * @param msg: the log message to write
   * @param ...args: format string values when `msg` is a format string
   */
  fatal: pino.LogFn;
}

/**
 * http logger config symbol
 */
export const httpCfgSym = Symbol("httpCfgSym");

/**
 * hono-pino logger
 */
// biome-ignore lint/suspicious/noUnsafeDeclarationMerging: <explanation>
export class PinoLogger {
  /**
   * Internal pino logger instance
   *
   * If you want to interact with the internal pino logger,
   * you can use it (not recommended)
   */
  _rootLogger: pino.Logger;

  /**
   * Internal child pino logger instance, recreated after each update bindings.
   *
   * If you want to interact with the internal pino logger,
   * you can use it (not recommended)
   */
  _logger: pino.Logger;
  // in cloudflare worker, pino logger bindings maybe not available
  // use custom internal bindings
  #bindings: pino.Bindings = {};

  [httpCfgSym]: {
    resMessage?: string | null;
    resLevel?: pino.Level | null;
  } = {};

  constructor(rootLogger: pino.Logger, childOptions?: pino.ChildLoggerOptions) {
    // Use a child logger to prevent unintended behavior from changes to the provided logger
    this._rootLogger = rootLogger.child({}, childOptions);
    this._logger = rootLogger;
    this.#bindings = this._logger.bindings();
  }

  /**
   * Get bindings from http log context
   */
  bindings(): pino.Bindings {
    return this.#bindings;
  }

  /**
   * Clear bindings from http log context
   */
  clearBindings(): this {
    this.#bindings = {};
    this._logger = this._rootLogger.child(this.#bindings);
    return this;
  }

  /**
   * Assign bindings to http log context
   */
  assign(
    bindings: pino.Bindings,
    opts?: {
      /** deep merge @default false */
      deep?: boolean;
    },
  ): this {
    this.#bindings = opts?.deep
      ? defu(bindings, this.#bindings)
      : { ...this.#bindings, ...bindings };

    this._logger = this._rootLogger.child(this.#bindings);
    return this;
  }

  /**
   * Override response log message
   */
  setResMessage(message: string | null): this {
    this[httpCfgSym].resMessage = message;
    return this;
  }

  /**
   * Override response log level
   */
  setResLevel(level: pino.Level | null): this {
    this[httpCfgSym].resLevel = level;
    return this;
  }
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
PinoLogger.prototype.trace = function (this, ...args: [any, ...any[]]) {
  this._logger.trace(...args);
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
PinoLogger.prototype.debug = function (this, ...args: [any, ...any[]]) {
  this._logger.debug(...args);
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
PinoLogger.prototype.info = function (this, ...args: [any, ...any[]]) {
  this._logger.info(...args);
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
PinoLogger.prototype.warn = function (this, ...args: [any, ...any[]]) {
  this._logger.warn(...args);
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
PinoLogger.prototype.error = function (this, ...args: [any, ...any[]]) {
  this._logger.error(...args);
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
PinoLogger.prototype.fatal = function (this, ...args: [any, ...any[]]) {
  this._logger.fatal(...args);
};
