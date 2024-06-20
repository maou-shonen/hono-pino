import { Hono } from "hono";
import { logger } from "../src/logger";

const app = new Hono()
  .use(logger())

  .get("/", async (c) => {
    c.var.logger.trace("trace log");
    c.var.logger.debug("debug log");
    c.var.logger.info("info log");
    c.var.logger.warn("warn log");
    c.var.logger.error("error log");
    c.var.logger.fatal("fatal log");

    return c.text("test");
  })

  .get("/error", async (c) => {
    throw new Error("a test error");
  });

export default app;
