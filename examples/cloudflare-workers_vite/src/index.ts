import { Hono } from "hono";
import { pinoLogger } from "../../../src"; // hono-pino package

const app = new Hono();

app.use(pinoLogger());

app.get("/", (c) => {
  return c.text("hello world");
});

export default app;
