import type { Context } from "hono";
import { PinoLogger } from "./logger";
import { pino } from "pino";

/**
 * get logger from context
 * @deprecated Please change to use `c.get("logger")`. will be removed in 1.0.0
 */
export function getLogger(c: Context): PinoLogger {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return c.get("logger");
}

export function isPino(value: unknown): value is pino.Logger {
  return (
    typeof value === "object" &&
    value !== null &&
    // issue: https://github.com/pinojs/pino/issues/2079
    // pino.symbols.messageKeySym in value
    "info" in value &&
    typeof value.info === "function" &&
    "child" in value &&
    typeof value.child === "function"
  );
}

/**
 * T must be literal string
 */
export type LiteralString<T> = T extends string
  ? string extends T
    ? never
    : T
  : never;

export const httpStatusCodes = {
  // Informational
  100: { code: 100, message: "Continue", emoji: "🟢" },
  101: { code: 101, message: "Switching Protocols", emoji: "🔀" },
  102: { code: 102, message: "Processing", emoji: "⏳" },
  103: { code: 103, message: "Early Hints", emoji: "💡" },

  // Success
  200: { code: 200, message: "OK", emoji: "✅" },
  201: { code: 201, message: "Created", emoji: "🆕" },
  202: { code: 202, message: "Accepted", emoji: "👌" },
  203: { code: 203, message: "Non-Authoritative Information", emoji: "ℹ️" },
  204: { code: 204, message: "No Content", emoji: "🚫" },
  205: { code: 205, message: "Reset Content", emoji: "🔄" },
  206: { code: 206, message: "Partial Content", emoji: "🧩" },
  207: { code: 207, message: "Multi-Status", emoji: "🗂️" },
  208: { code: 208, message: "Already Reported", emoji: "📌" },
  226: { code: 226, message: "IM Used", emoji: "📧" },

  // Redirection
  300: { code: 300, message: "Multiple Choices", emoji: "🔀" },
  301: { code: 301, message: "Moved Permanently", emoji: "➡️" },
  302: {
    code: 302,
    message: "Found (Previously 'Moved Temporarily')",
    emoji: "🔍",
  },
  303: { code: 303, message: "See Other", emoji: "👀" },
  304: { code: 304, message: "Not Modified", emoji: "🔄" },
  305: { code: 305, message: "Use Proxy", emoji: "🌐" },
  307: { code: 307, message: "Temporary Redirect", emoji: "↪️" },
  308: { code: 308, message: "Permanent Redirect", emoji: "➡️" },

  // Client Error
  400: { code: 400, message: "Bad Request", emoji: "❌" },
  401: { code: 401, message: "Unauthorized", emoji: "🔒" },
  402: { code: 402, message: "Payment Required", emoji: "💳" },
  403: { code: 403, message: "Forbidden", emoji: "🚫" },
  404: { code: 404, message: "Not Found", emoji: "🔍" },
  405: { code: 405, message: "Method Not Allowed", emoji: "⛔" },
  406: { code: 406, message: "Not Acceptable", emoji: "🙅" }, // Simplified to a single-character emoji
  407: { code: 407, message: "Proxy Authentication Required", emoji: "🌐" },
  408: { code: 408, message: "Request Timeout", emoji: "⌛" },
  409: { code: 409, message: "Conflict", emoji: "⚔️" },
  410: { code: 410, message: "Gone", emoji: "👻" },
  411: { code: 411, message: "Length Required", emoji: "📏" },
  412: { code: 412, message: "Precondition Failed", emoji: "❌" },
  413: { code: 413, message: "Payload Too Large", emoji: "🐘" },
  414: { code: 414, message: "URI Too Long", emoji: "🔗" },
  415: { code: 415, message: "Unsupported Media Type", emoji: "🚫" },
  416: { code: 416, message: "Range Not Satisfiable", emoji: "➖" },
  417: { code: 417, message: "Expectation Failed", emoji: "😞" },
  418: { code: 418, message: "I'm a teapot", emoji: "🫖" },
  421: { code: 421, message: "Misdirected Request", emoji: "⚠️" },
  422: { code: 422, message: "Unprocessable Entity", emoji: "⚠️" },
  423: { code: 423, message: "Locked", emoji: "🔒" },
  424: { code: 424, message: "Failed Dependency", emoji: "🔗" },
  425: { code: 425, message: "Too Early", emoji: "⏰" },
  426: { code: 426, message: "Upgrade Required", emoji: "⬆️" },
  428: { code: 428, message: "Precondition Required", emoji: "⚠️" },
  429: { code: 429, message: "Too Many Requests", emoji: "✋" },
  431: { code: 431, message: "Request Header Fields Too Large", emoji: "⚠️" },
  451: { code: 451, message: "Unavailable For Legal Reasons", emoji: "⚖️" },

  // Server Error
  500: { code: 500, message: "Internal Server Error", emoji: "💥" },
  501: { code: 501, message: "Not Implemented", emoji: "🚧" },
  502: { code: 502, message: "Bad Gateway", emoji: "⚠️" },
  503: { code: 503, message: "Service Unavailable", emoji: "🚫" },
  504: { code: 504, message: "Gateway Timeout", emoji: "⌛" },
  505: { code: 505, message: "HTTP Version Not Supported", emoji: "⚠️" },
  506: { code: 506, message: "Variant Also Negotiates", emoji: "🔄" },
  507: { code: 507, message: "Insufficient Storage", emoji: "💾" },
  508: { code: 508, message: "Loop Detected", emoji: "🔄" },
  510: { code: 510, message: "Not Extended", emoji: "⚠️" },
  511: { code: 511, message: "Network Authentication Required", emoji: "🌐" },
};

export const ANSI = {
  Reset: "\x1b[0m",
  Bright: "\x1b[1m",

  FgRed: "\x1b[31m",
  FgGreen: "\x1b[32m",
  FgYellow: "\x1b[33m",
  FgPurple: "\x1b[35m",
};
export const statusColors = (status: unknown) => {
  const statusCode = status as number;
  //  200 range
  if (statusCode >= 200 && statusCode < 300) {
    return ANSI.FgGreen;
  }
  //  300 range
  if (statusCode >= 300 && statusCode < 400) {
    return ANSI.FgPurple;
  }
  //  400 range
  if (statusCode >= 400 && statusCode < 500) {
    return ANSI.FgRed;
  }
  //  500 range
  if (statusCode >= 500) {
    return ANSI.FgYellow;
  }
};
export const getMinimalMessage = (bindings: pino.Bindings) => {
  const fancyStatusCodes = (status: unknown) => {
    const statusCode = status as keyof typeof httpStatusCodes;
    if (statusCode in httpStatusCodes) {
      return httpStatusCodes[statusCode as keyof typeof httpStatusCodes];
    }
  };

  const minimalMessages = [
    fancyStatusCodes(bindings.res.status)?.emoji + " ",
    bindings.req.url,
    bindings.req.method,
    `${statusColors(bindings?.res?.status)}`,
    bindings.res.status,
    fancyStatusCodes(bindings.res.status)?.message,
    `${ANSI.Reset}`,
    bindings?.res?.headers?.get("content-type"),
    bindings.responseTime + "ms",
  ];
  return minimalMessages.filter(Boolean).join(" ");
};
