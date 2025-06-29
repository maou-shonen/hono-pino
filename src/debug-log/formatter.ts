import type { BindingsFormatter, TimeFormatter } from "./types";
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
  const bindingsStr = JSON.stringify(bindings);
  if (opts?.colorEnabled) {
    return `${ANSI.FgGray}${bindingsStr}${ANSI.Reset}`;
  }
  return bindingsStr;
};
