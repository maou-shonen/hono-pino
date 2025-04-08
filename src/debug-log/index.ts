import { pino } from "pino";
import build from "pino-abstract-transport";
import {
  type BindingsFormatter,
  defaultBindingsFormat,
  defaultTimeFormatter,
  type TimeFormatter,
} from "./formatter";
import { ANSI, addLogLevelColor, addStatusColor } from "./utils";

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
}

/**
 * hono-pino/debug-log transport
 */
export default async function (opts: DebugLogOptions) {
  const messageKey = opts.messageKey ?? "msg";
  const requestKey = opts.requestKey ?? "req";
  const responseKey = opts.responseKey ?? "res";
  const levelLabelMap = opts.levelLabelMap ?? pino.levels.labels;
  const levelMaxLength = Object.values(levelLabelMap).reduce(
    (max, label) => Math.max(max, label.length),
    0,
  );

  const normalLogFormat =
    opts.normalLogFormat ?? "[{time}] {levelLabel} - {msg}";
  const httpLogFormat =
    opts.httpLogFormat ??
    "[{time}] {reqId} {req.method} {req.url} {res.status} - {msg} ({responseTime}ms)";

  const timeFormatter = opts.timeFormatter ?? defaultTimeFormatter;
  const bindingsFormatter = opts.bindingsFormatter ?? defaultBindingsFormat;

  return build(async (source) => {
    for await (const obj of source) {
      const {
        level,
        time,
        [messageKey]: msg,
        reqId,
        responseTime,
        [requestKey]: req,
        [responseKey]: res,
        ...rest
      } = obj;

      const timeStr = timeFormatter(time);
      const levelLabel = (levelLabelMap[level] ?? "")
        .toUpperCase()
        .padStart(levelMaxLength);
      const levelLabelWithColor = addLogLevelColor(levelLabel, level);
      const status = addStatusColor(res?.status?.toString(), res?.status);

      const textMap = {
        time: timeStr,
        level,
        levelLabel: levelLabelWithColor,
        msg,
        reqId: `${ANSI.BgGray}${reqId}${ANSI.Reset}`,
        responseTime,
        "req.method": req?.method,
        "req.url": req?.url,
        "res.status": status,
      };

      const isHttpLog = !!res;
      const logFormat = isHttpLog ? httpLogFormat : normalLogFormat;

      const output = Object.entries(textMap).reduce(
        (acc, [key, value]) => acc.replace(`{${key}}`, value),
        logFormat,
      );
      const bindingsStr = bindingsFormatter(rest);
      console.log(output, bindingsStr);
    }
  });
}
