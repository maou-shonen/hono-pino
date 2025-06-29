import { Hono } from "hono";
import { pinoLogger } from "../src";

const app = new Hono()
  .use(pinoLogger())

  .get("/", async (c) => {
    const { logger } = c.var;

    logger.trace;

    logger.debug("debug log");

    logger.assign({
      foo: "bar",
    });

    logger.info("info log");

    logger.assign({
      data: [1, 2, 3],
    });

    logger.warn("warn log");

    logger.assign({
      foo: "baz",
      data: [4], // replace
    });

    return c.text("hello world");
  })

  .get("/error", async (_c) => {
    throw new Error("a test error");
  });

export default app;
