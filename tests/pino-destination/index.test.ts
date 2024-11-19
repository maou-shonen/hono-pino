import { spawn } from "node:child_process";
import * as path from "node:path";
import { expect, it } from "vitest";

it("pino destination", () =>
  new Promise((done) => {
    const fp = path.join(import.meta.dirname, "./pino-destination.js");
    const p = spawn("node", [fp]);

    p.stdout.on("data", (data) => {
      const log = JSON.parse(data.toString());
      expect(log.level).toBe(30);
      expect(log.msg).toBe("Request completed");
      p.kill(0);
    });

    p.on("exit", (code) => {
      expect(code).toBe(0);
      done(code);
    });
  }));
