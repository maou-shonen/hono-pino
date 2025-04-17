import { pino } from "pino";
import { defaultBindingsFormat, defaultTimeFormatter } from "./formatter";
import type { DebugLogOptions } from "./types";
import { ANSI, addLogLevelColor, addStatusColor } from "./utils";

export function createHandler(opts?: DebugLogOptions): (obj: unknown) => void {
  const messageKey = opts?.messageKey ?? "msg";
  const requestKey = opts?.requestKey ?? "req";
  const responseKey = opts?.responseKey ?? "res";
  const levelLabelMap = opts?.levelLabelMap ?? pino.levels.labels;
  const levelMaxLength = Object.values(levelLabelMap).reduce(
    (max, label) => Math.max(max, label.length),
    0,
  );

  const normalLogFormat =
    opts?.normalLogFormat ?? "[{time}] {levelLabel} - {msg}";
  const httpLogFormat =
    opts?.httpLogFormat ??
    "[{time}] {reqId} {req.method} {req.url} {res.status} - {msg} ({responseTime}ms)";

  const timeFormatter = opts?.timeFormatter ?? defaultTimeFormatter;
  const bindingsFormatter = opts?.bindingsFormatter ?? defaultBindingsFormat;
  const printer = opts?.printer ?? console.log;

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
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
    printer(output, bindingsStr);
  };

  return handler;
}
