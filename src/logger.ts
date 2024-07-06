import { pino } from "pino";

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
