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

export class PinoLogger {
  #rootLogger: pino.Logger;
  // Use the _ prefix to indicate that this should not be used
  _logger: pino.Logger;

  constructor(rootLogger: pino.Logger) {
    this.#rootLogger = rootLogger.child({});
    this._logger = rootLogger;
  }

  /**
   * Get bindings from http log context
   */
  bindings() {
    return this._logger.bindings();
  }

  /**
   * Set bindings to http log context
   */
  setBindings(bindings: pino.Bindings) {
    this._logger = this.#rootLogger.child(bindings);
  }

  /**
   * Assign bindings to http log context (default shallow merge)
   */
  assign(
    bindings: pino.Bindings,
    opts?: {
      /** deep merge */
      deep?: boolean;
    },
  ) {
    const newBindings = opts?.deep
      ? defu(bindings, this._logger.bindings())
      : { ...this._logger.bindings(), ...bindings };

    this._logger = this.#rootLogger.child(newBindings);
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
