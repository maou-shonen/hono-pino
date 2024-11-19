import { pinoLogger } from "../../dist/index.cjs";
import { Hono } from "hono";
import { pino } from "pino";

const app = new Hono().use(
  pinoLogger({
    pino: pino.destination(1),
  }),
);

app.get("/", (c) => {
  return c.text("ok");
});

await app.request("/");
