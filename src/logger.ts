/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import { pino } from "pino";

export interface PinoLogger {
  logger: pino.Logger;
  trace: pino.LogFn;
  debug: pino.LogFn;
  info: pino.LogFn;
  warn: pino.LogFn;
  error: pino.LogFn;
  fatal: pino.LogFn;
}

export class PinoLogger {
  #rootLogger: pino.Logger;
  logger: pino.Logger;

  constructor(rootLogger: pino.Logger) {
    this.#rootLogger = rootLogger.child({});
    this.logger = rootLogger;
  }

  /**
   * assign bindings to http log context
   */
  assign(bindings: pino.Bindings) {
    this.logger = this.#rootLogger.child({
      ...this.logger.bindings(),
      ...bindings,
    });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
PinoLogger.prototype.trace = function (this, ...args: [any, ...any]) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  this.logger.trace(...args);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
PinoLogger.prototype.debug = function (this, ...args: [any, ...any[]]) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  this.logger.debug(...args);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
PinoLogger.prototype.info = function (this, ...args: [any, ...any]) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  this.logger.info(...args);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
PinoLogger.prototype.warn = function (this, ...args: [any, ...any]) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  this.logger.warn(...args);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
PinoLogger.prototype.error = function (this, ...args: [any, ...any]) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  this.logger.error(...args);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
PinoLogger.prototype.fatal = function (this, ...args: [any, ...any]) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  this.logger.fatal(...args);
};
