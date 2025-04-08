import { isUnixTime } from "./utils";

export type TimeFormatter = (time: number | string | undefined) => string;

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
  return `${date.toISOString().slice(11, 19)}.${date.getMilliseconds()}`; // HH:mm:ss.SSS
};

export type BindingsFormatter = (bindings: Record<string, unknown>) => string;

export const defaultBindingsFormat: BindingsFormatter = (bindings) => {
  return Object.entries(bindings).reduce((acc, [key, value]) => {
    return `${acc}\n  & ${key}: ${JSON.stringify(value)}`;
  }, "");
};
