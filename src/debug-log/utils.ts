import { getColorEnabled } from "hono/utils/color";

// https://en.wikipedia.org/wiki/ANSI_escape_code#Colors
export const ANSI = {
  Reset: "\x1b[0m",
  Bright: "\x1b[1m",

  FgWhite: "\x1b[37m",
  FgRed: "\x1b[31m",
  FgGreen: "\x1b[32m",
  FgYellow: "\x1b[33m",
  FgMagenta: "\x1b[35m",
  FgCyan: "\x1b[36m",
  FgGray: "\x1b[90m",

  BgGray: "\x1b[100m",
};

export function isUnixTime(time: number): boolean {
  const UnixTimeMax = 4102444800; // 2100-01-01T00:00:00Z
  return time <= UnixTimeMax;
}

export function addLogLevelColor(
  text: string,
  level: number,
  opts?: { colorEnabled?: boolean },
): string {
  const colorEnabled = opts?.colorEnabled ?? getColorEnabled();

  if (colorEnabled) {
    if (level === 10) {
      return `${ANSI.FgGray}${text}${ANSI.Reset}`;
    }
    if (level === 20) {
      return `${ANSI.FgCyan}${text}${ANSI.Reset}`;
    }
    if (level === 30) {
      return `${ANSI.FgGreen}${text}${ANSI.Reset}`;
    }
    if (level === 40) {
      return `${ANSI.FgYellow}${text}${ANSI.Reset}`;
    }
    if (level === 50) {
      return `${ANSI.FgRed}${text}${ANSI.Reset}`;
    }
    if (level === 60) {
      return `${ANSI.FgMagenta}${text}${ANSI.Reset}`;
    }
  }

  return text;
}

export function addStatusColor(
  text: string,
  status: number,
  opts?: {
    colorEnabled?: boolean;
  },
): string {
  const colorEnabled = opts?.colorEnabled ?? getColorEnabled();

  if (colorEnabled) {
    const statusCategory = (status / 100) | 0;

    if (statusCategory === 5) {
      return `${ANSI.FgRed}${text}${ANSI.Reset}`;
    }
    if (statusCategory === 4) {
      return `${ANSI.FgYellow}${text}${ANSI.Reset}`;
    }
    if (statusCategory === 3) {
      return `${ANSI.FgCyan}${text}${ANSI.Reset}`;
    }
    if (statusCategory === 2) {
      return `${ANSI.FgGreen}${text}${ANSI.Reset}`;
    }
  }

  return text;
}
