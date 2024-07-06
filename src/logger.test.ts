import { describe, it, expect, beforeEach } from "vitest";
import { PinoLogger } from "./logger";
import { pino } from "pino";
import { isPinoLogger } from "./utils";

describe("logger", () => {
  let logs: Record<string, any>[] = [];
  const logger = new PinoLogger(
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

  beforeEach(() => {
    logs = []; // reset
  });

  it("test", () => {
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

  it("isPinoLogger", () => {
    logger.assign({ foo: "bar" });
    logger.info("foo");
    expect(logs[0]).toStrictEqual({
      msg: "foo",
      level: 30,
      foo: "bar",
    });

    logger.assign({ foo2: "hello" });
    logger.info("foo2");
    expect(logs[1]).toStrictEqual({
      msg: "foo2",
      level: 30,
      foo: "bar",
      foo2: "hello",
    });

    logger.assign({ foo: "override", foo3: "world" });
    logger.info("foo3");
    expect(logs[2]).toStrictEqual({
      msg: "foo3",
      level: 30,
      foo: "override",
      foo2: "hello",
      foo3: "world",
    });
  });
});
