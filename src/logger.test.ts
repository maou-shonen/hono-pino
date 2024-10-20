import { describe, it, expect, beforeEach } from "vitest";
import { PinoLogger } from "./logger";
import { pino } from "pino";

describe("logger", () => {
  let logs: Record<string, any>[] = [];
  let logger: PinoLogger;

  beforeEach(() => {
    // reset
    logs = [];
    logger = new PinoLogger(
      pino(
        {
          level: "trace",
          base: null,
          timestamp: false,
        },
        {
          write: (data) => logs.push(JSON.parse(data)),
        },
      ),
    );
  });

  it("basic", () => {
    logger.trace("foo1");
    logger.debug("foo2");
    logger.info("foo3");
    logger.warn("foo4");
    logger.error("foo5");
    logger.fatal("foo6");
    expect(logs).toHaveLength(6);
    expect(logs[0].msg).toBe("foo1");
    expect(logs[0].level).toBe(10);
    expect(logs[1].msg).toBe("foo2");
    expect(logs[1].level).toBe(20);
    expect(logs[2].msg).toBe("foo3");
    expect(logs[2].level).toBe(30);
    expect(logs[3].msg).toBe("foo4");
    expect(logs[3].level).toBe(40);
    expect(logs[4].msg).toBe("foo5");
    expect(logs[4].level).toBe(50);
    expect(logs[5].msg).toBe("foo6");
    expect(logs[5].level).toBe(60);
  });

  it("get bindings", () => {
    logger.assign({ foo: "bar" });
    expect(logger.bindings()).toStrictEqual({ foo: "bar" });
  });

  it("set bindings", () => {
    logger.setBindings({ foo: "bar" });
    logger.info("foo");
    expect(logs[0]).toStrictEqual({
      msg: "foo",
      level: 30,
      foo: "bar",
    });
  });

  it("assign", () => {
    logger.assign({ foo: "bar" });
    logger.info("foo");
    expect(logs[0]).toStrictEqual({
      msg: "foo",
      level: 30,
      foo: "bar",
    });
  });

  it("assign shallow merge", () => {
    logger.assign({ a: 1, b: { c: 2, d: 3 } });
    logger.assign({ b: { c: 4, e: 5 } }, { deep: false });
    logger.info("foo");
    expect(logs[0]).toStrictEqual({
      msg: "foo",
      level: 30,
      a: 1,
      b: { c: 4, e: 5 },
    });
  });

  it("assign deep merge", () => {
    logger.assign({ a: 1, b: { c: 2, d: 3 } });
    logger.assign({ b: { c: 4, e: 5 } }, { deep: true });
    logger.info("foo");
    expect(logs[0]).toStrictEqual({
      msg: "foo",
      level: 30,
      a: 1,
      b: { c: 4, d: 3, e: 5 },
    });
  });
});
