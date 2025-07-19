import { spawn } from "node:child_process";
import { describe, expect, it } from "vitest";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const targets = [
  {
    name: "cloudflare-workers_vite",
    cmd: "pnpm --filter=cloudflare-worker-vite-example run dev",
    url: "http://localhost:5173/",
    ready: /ready/i,
  },
  {
    name: "honox (Node)",
    cmd: "pnpm --filter=honox-example run dev",
    url: "http://localhost:5173/",
    ready: /ready/i,
  },
];

describe("examples e2e", () => {
  for (const target of targets) {
    it(target.name, async () => {
      const proc = spawn(target.cmd, { shell: true });
      let ready = false;
      proc.stdout.on("data", (d) => {
        if (target.ready.test(d.toString())) ready = true;
      });
      proc.stderr.on("data", (d) => {
        if (target.ready.test(d.toString())) ready = true;
      });

      // wait for the server to be ready
      for (let i = 0; i < 30 && !ready; i++) await sleep(500);
      if (!ready) {
        proc.kill();
        throw new Error("Server not ready: " + target.name);
      }

      // test the server
      const res = await fetch(target.url);
      const text = await res.text();
      expect(res.status).toBe(200);
      expect(/hello/i.test(text)).toBe(true);

      proc.kill();
    }, 25000);
  }
});
