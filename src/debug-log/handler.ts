import { getColorEnabled } from "hono/utils/color";
import { pino } from "pino";
import { defaultBindingsFormat, defaultTimeFormatter } from "./formatter";
import type { DebugLogOptions } from "./types";
import { ANSI, addLogLevelColor, addStatusColor } from "./utils";

/**
 * Create a debug-log handler for pretty-printing pino logs in development.
 */
export function createHandler(opts?: DebugLogOptions): (obj: unknown) => void {
  const colorEnabled = opts?.colorEnabled ?? getColorEnabled();
  const messageKey = opts?.messageKey ?? "msg";
  const requestKey = opts?.requestKey ?? "req";
  const responseKey = opts?.responseKey ?? "res";
  const levelLabelMap = opts?.levelLabelMap ?? pino.levels.labels;
  const levelMaxLength = Object.values(levelLabelMap).reduce(
    (max, label) => Math.max(max, label.length),
    0,
  );

  // Format strings for normal and HTTP logs. {bindings} will be replaced with formatted context.
  const normalLogFormat =
    opts?.normalLogFormat ?? "[{time}] {levelLabel} - {msg}";
  const httpLogFormat =
    opts?.httpLogFormat ??
    "[{time}] {reqId} {req.method} {req.url} {res.status} ({responseTime}ms) - {msg} {bindings}";

  const timeFormatter = opts?.timeFormatter ?? defaultTimeFormatter;
  const bindingsFormatter = opts?.bindingsFormatter ?? defaultBindingsFormat;
  const printer = opts?.printer ?? console.log;

  const handler = (obj: any) => {
    const {
      level,
      time,
      [messageKey]: msg,
      reqId,
      responseTime,
      [requestKey]: req,
      [responseKey]: res,
      ...rest
    } = obj ?? {};

    const timeStr = timeFormatter(time);
    const levelLabel = (levelLabelMap[level] ?? "")
      .toUpperCase()
      .padEnd(levelMaxLength);

    const status = addStatusColor(res?.status?.toString(), res?.status, {
      colorEnabled,
    });

    // textMap is used for template replacement in logFormat.
    // 'bindings' is the formatted context (excluding standard log fields).
    const textMap = {
      time: timeStr,
      level,
      levelLabel: colorEnabled
        ? addLogLevelColor(levelLabel, level, {
            colorEnabled,
          })
        : levelLabel,
      msg,
      reqId: colorEnabled ? `${ANSI.BgGray}${reqId}${ANSI.Reset}` : reqId,
      responseTime,
      "req.method": req?.method,
      "req.url": req?.url,
      "res.status": status,
      // Format and colorize context/bindings if present
      bindings: bindingsFormatter(rest, {
        colorEnabled: colorEnabled,
      }),
    };

    const isHttpLog = !!res;
    const logFormat = isHttpLog ? httpLogFormat : normalLogFormat;

    // Replace placeholders in format string with actual values
    const output = Object.entries(textMap).reduce(
      (acc, [key, value]) => acc.replace(`{${key}}`, value),
      logFormat,
    );

    printer(output);
  };

  return handler;
}
