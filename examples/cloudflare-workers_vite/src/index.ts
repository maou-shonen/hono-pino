import type { MiddlewareHandler } from "hono";
import { Hono } from "hono";
import type { Env as HonoPinoEnv } from "../../../src";
import { pinoLogger } from "../../../src"; // hono-pino package

const app = new Hono<HonoPinoEnv>();

const loggerMiddleware: MiddlewareHandler<HonoPinoEnv, "*"> = pinoLogger();

app.use("*", loggerMiddleware);

app.get("/", (c) => {
  return c.text("hello world");
});

export default app;
