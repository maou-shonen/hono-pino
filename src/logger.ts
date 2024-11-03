/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import defu from "defu";
import { pino } from "pino";

export interface PinoLogger {
  trace: pino.LogFn;
  debug: pino.LogFn;
  info: pino.LogFn;
  warn: pino.LogFn;
  error: pino.LogFn;
  fatal: pino.LogFn;
}

/**
 * http logger config symbol
 */
export const httpCfgSym = Symbol();

/**
 * hono-pino logger
 */
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

  [httpCfgSym]: {
    resMessage?: string | null;
    resLevel?: pino.Level | null;
  } = {};

  constructor(rootLogger: pino.Logger) {
    // Use a child logger to prevent unintended behavior from changes to the provided logger
    this._rootLogger = rootLogger.child({});
    this._logger = rootLogger;
  }

  /**
   * Get bindings from http log context
   */
  bindings(): pino.Bindings {
    return this._logger.bindings();
  }

  /**
   * Clear bindings from http log context
   */
  clearBindings(): this {
    this._logger = this._rootLogger.child({});
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
    const newBindings = opts?.deep
      ? defu(bindings, this._logger.bindings())
      : { ...this._logger.bindings(), ...bindings };

    this._logger = this._rootLogger.child(newBindings);
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
PinoLogger.prototype.trace = function (this, ...args: [any, ...any]) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  this._logger.trace(...args);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
PinoLogger.prototype.debug = function (this, ...args: [any, ...any[]]) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  this._logger.debug(...args);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
PinoLogger.prototype.info = function (this, ...args: [any, ...any]) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  this._logger.info(...args);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
PinoLogger.prototype.warn = function (this, ...args: [any, ...any]) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  this._logger.warn(...args);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
PinoLogger.prototype.error = function (this, ...args: [any, ...any]) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  this._logger.error(...args);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
PinoLogger.prototype.fatal = function (this, ...args: [any, ...any]) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  this._logger.fatal(...args);
};
