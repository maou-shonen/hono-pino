/**
 * hono-pino/debug-log options
 */
export interface DebugLogOptions {
  /**
   * Message key
   * @default "msg"
   */
  messageKey?: string;
  /**
   * Request key
   * @default "req"
   */
  requestKey?: string;
  /**
   * Response key
   * @default "res"
   */
  responseKey?: string;
  /**
   * Level label map
   * @default {@link pino.levels.labels}
   */
  levelLabelMap?: Record<number, string>;
  /**
   * Normal log format
   * @default `[{time}] {levelLabel} - {msg}`
   */
  normalLogFormat?: string;
  /**
   * HTTP log format
   * @default `[{time}] {reqId} {req.method} {req.url} {res.status} - {msg} ({responseTime}ms)`
   */
  httpLogFormat?: string;
  /**
   * Time formatter
   * @default {@link defaultTimeFormatter}
   */
  timeFormatter?: TimeFormatter;
  /**
   * Bindings formatter
   * @default {@link defaultBindingsFormat}
   */
  bindingsFormatter?: BindingsFormatter;
  /**
   * Printer function
   * @default `console.log`
   */
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  printer?: (...data: any[]) => void;
}

export type TimeFormatter = (time: number | string | undefined) => string;
export type BindingsFormatter = (bindings: Record<string, unknown>) => string;
