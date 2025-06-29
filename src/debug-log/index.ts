import build from "pino-abstract-transport";
import { createHandler } from "./handler";
import type { DebugLogOptions } from "./types";

export type * from "./types";

/**
 * hono-pino/debug-log transport
 */
export default async function (opts?: DebugLogOptions) {
  const handler = opts?._handler ?? createHandler(opts);

  return build(async (source) => {
    // for await (const obj of source) {
    //   handler(obj);
    // }
    source.on("data", (line) => {
      handler(line);
    });
  });
}
