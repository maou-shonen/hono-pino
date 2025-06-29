import { getColorEnabled } from "hono/utils/color";

/**
 * Default log level formatter (with color support).
 */
export const defaultLevelFormatter: LevelFormatter = (
  label,
  level,
  opts,
): string => {
  const { colorEnabled = getColorEnabled() } = opts ?? {};

  if (colorEnabled) {
    if (level === 10) return `${ANSI.FgGray}${label}${ANSI.Reset}`;
    if (level === 20) return `${ANSI.FgCyan}${label}${ANSI.Reset}`;
    if (level === 30) return `${ANSI.FgGreen}${label}${ANSI.Reset}`;
    if (level === 40) return `${ANSI.FgYellow}${label}${ANSI.Reset}`;
    if (level === 50) return `${ANSI.FgRed}${label}${ANSI.Reset}`;
    if (level === 60) return `${ANSI.FgMagenta}${label}${ANSI.Reset}`;
  }
  return label;
};

import type { BindingsFormatter, LevelFormatter, TimeFormatter } from "./types";
import { ANSI, isUnixTime } from "./utils";

export const defaultTimeFormatter: TimeFormatter = (time) => {
  if (!time) {
    return "";
  }

  if (typeof time === "string") {
    return time;
  }

  if (isUnixTime(time)) {
    const unixTime = new Date(time * 1000);
    return unixTime.toISOString().slice(11, 19); // HH:mm:ss
  }

  const date = new Date(time);
  const ms = date.getMilliseconds().toString().padEnd(3, "0");
  return `${date.toISOString().slice(11, 19)}.${ms}`; // HH:mm:ss.SSS
};

export const defaultBindingsFormat: BindingsFormatter = (bindings, opts) => {
  const { colorEnabled = getColorEnabled() } = opts ?? {};

  const bindingsStr = JSON.stringify(bindings);
  if (colorEnabled) {
    return `${ANSI.FgGray}${bindingsStr}${ANSI.Reset}`;
  }
  return bindingsStr;
};
