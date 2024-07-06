import { Hono } from "hono";
import { logger } from "../src";

const app = new Hono()
  .use(logger())

  .get("/", async (c) => {
    c.var.logger.debug("debug log");

    c.var.logger.assign({
      foo: "bar",
    });

    c.var.logger.info("info log");

    c.var.logger.assign({
      data: [1, 2, 3],
    });

    c.var.logger.warn("warn log");

    c.var.logger.assign({
      foo: "baz",
      data: [4], // replace
    });

    return c.text("hello world");
  })

  .get("/error", async (c) => {
    throw new Error("a test error");
  });

export default app;
