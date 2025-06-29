/**
 * hono-pino/debug-log options
 */
export interface DebugLogOptions {
  /**
   * Function to format the log level label (for color or custom style).
   * @default defaultLevelFormatter
   */
  levelFormatter?: LevelFormatter;
  /**
   * Enable or disable color output for log levels, status, and context.
   * - true: always use color
   * - false: never use color
   * - undefined: auto-detect (default)
   */
  colorEnabled?: boolean;

  /**
   * The key for the log message in the log object.
   * @default "msg"
   */
  messageKey?: string;

  /**
   * The key for the request object in the log object.
   * @default "req"
   */
  requestKey?: string;

  /**
   * The key for the response object in the log object.
   * @default "res"
   */
  responseKey?: string;

  /**
   * Map of log level numbers to their string labels.
   * @default pino.levels.labels
   */
  levelLabelMap?: Record<number, string>;

  /**
   * Format string for normal logs (non-HTTP).
   * Placeholders: {time}, {levelLabel}, {msg}
   * @default "[{time}] {levelLabel} - {msg}"
   */
  normalLogFormat?: string;

  /**
   * Format string for HTTP logs.
   * Placeholders: {time}, {reqId}, {req.method}, {req.url}, {res.status}, {responseTime}, {msg}, {bindings}
   * @default "[{time}] {reqId} {req.method} {req.url} {res.status} - {msg} ({responseTime}ms)"
   */
  httpLogFormat?: string;

  /**
   * Function to format the time value for display.
   * @default defaultTimeFormatter
   */
  timeFormatter?: TimeFormatter;

  /**
   * Function to format the context (bindings) for display.
   * @default defaultBindingsFormat
   */
  bindingsFormatter?: BindingsFormatter;

  /**
   * Function to print the final log output. Defaults to console.log.
   * @default console.log
   */
  printer?: (...data: any[]) => void;

  /**
   * Internal handler for advanced usage. Usually not needed.
   */
  _handler?: (obj: unknown) => void;
}

/**
 * Formats the log level label for output (with or without color).
 * @param label The string label for the log level (e.g., 'INFO')
 * @param level The numeric log level
 * @param colorEnabled Whether to use color
 * @returns Formatted string for the log level
 */
export type LevelFormatter = (
  label: string,
  level: number,
  opts?: {
    colorEnabled?: boolean;
  },
) => string;

/**
 * Formats a time value (number, string, or undefined) for log output.
 */
export type TimeFormatter = (time: number | string | undefined) => string;

/**
 * Formats the context (bindings) object for log output.
 * @param bindings The context object (excluding standard log fields)
 * @param opts.colorEnabled Whether to use color for the output
 * @returns Formatted string for context
 */
export type BindingsFormatter = (
  bindings: Record<string, unknown>,
  opts?: { colorEnabled?: boolean },
) => string;
