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
      const output: string[] = [];
      let ready = false;

      const cleanup = () => {
        if (!proc.killed) {
          proc.kill('SIGTERM');
          // Force kill after timeout
          setTimeout(() => proc.kill('SIGKILL'), 5000);
        }
      };

      proc.stdout.on("data", (d) => {
        const text = d.toString();
        output.push(text);
        if (target.ready.test(text)) ready = true;
      });
      proc.stderr.on("data", (d) => {
        const text = d.toString();
        output.push(text);
        if (target.ready.test(text)) ready = true;
      });

      // wait for the server to be ready
      for (let i = 0; i < 30 && !ready; i++) await sleep(500);
      if (!ready) {
        cleanup();
        throw new Error(`Server not ready: ${target.name}\nOutput:\n${output.join('')}`);
      }

      try {
        // test the server
        const res = await fetch(target.url);
        const text = await res.text();
        expect(res.status).toBe(200);
        expect(/hello/i.test(text)).toBe(true);
      } finally {
        cleanup();
      }
    }, 25000);
  }
});
