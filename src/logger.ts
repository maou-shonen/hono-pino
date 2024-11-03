/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import defu from "defu";
import { pino } from "pino";

export interface PinoLogger {
  _logger: pino.Logger;
  trace: pino.LogFn;
  debug: pino.LogFn;
  info: pino.LogFn;
  warn: pino.LogFn;
  error: pino.LogFn;
  fatal: pino.LogFn;
}

/**
 * hono-pino logger
 */
export class PinoLogger {
  #rootLogger: pino.Logger;
  // Use the _ prefix to indicate that this should not be used
  _logger: pino.Logger;
  resMessage?: string | null;
  resLevel?: pino.Level | null;

  constructor(rootLogger: pino.Logger) {
    this.#rootLogger = rootLogger.child({});
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
    this._logger = this.#rootLogger.child({});
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

    this._logger = this.#rootLogger.child(newBindings);
    return this;
  }

  /**
   * Override response log message
   */
  setResMessage(message: string | null): this {
    this.resMessage = message;
    return this;
  }

  /**
   * Override response log level
   */
  setResLevel(level: pino.Level | null): this {
    this.resLevel = level;
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
