import { describe, it, expect } from "vitest";
import { Hono } from "hono";
import { pinoLogger } from "./middleware";
import type { Options } from "./types";
import { pino } from "pino";
import { PinoLogger } from "./logger";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const createMockApp = (logHttpOpts?: Options["http"]) => {
  const logs: Record<string, any>[] = [];
  const app = new Hono()
    .use(
      pinoLogger({
        pino: pino(
          { level: "trace", base: null, timestamp: false },
          {
            write: (data) => logs.push(JSON.parse(data)),
          },
        ),
        http: logHttpOpts,
      }),
    )
    .get("/", async (c) => c.text("ok"));

  return {
    logs,
    app,
  };
};

const mockRequest = async (logHttpOpts?: Options["http"]) => {
  const { logs, app } = createMockApp(logHttpOpts);

  const res = await app.request("/");
  expect(res.status).toBe(200);
  expect(res.text()).resolves.toBe("ok");

  return {
    logs,
    app,
    res,
  };
};

const defaultReqLog = {
  level: 30,
  msg: "Request received",
  req: {
    url: "/",
    method: "GET",
    headers: {},
  },
};
const defaultResLog = {
  ...defaultReqLog,
  msg: "Request completed",
  res: {
    status: 200,
    headers: {},
  },
};
const expectReqLog = (log: any, extendLog: Record<string, any>) => {
  expect(log).toMatchObject({
    ...defaultReqLog,
    ...extendLog,
  });
};

describe("http logger", async () => {
  it("full disable", async () => {
    const { logs } = await mockRequest(false);

    expect(logs.length).toBe(0);
  });

  it("full default", async () => {
    const { logs } = await mockRequest();

    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({ ...defaultResLog, reqId: 1 });
  });

  it("disable reqId", async () => {
    const { logs } = await mockRequest({
      reqId: false,
    });

    expect(logs).toHaveLength(1);
    expect(logs[0].reqId).toBeUndefined();
    expect(logs[0]).toMatchObject(defaultResLog);
  });

  it("custom reqId", async () => {
    const { logs } = await mockRequest({
      reqId: () => "foo",
    });

    expect(logs).toHaveLength(1);
    expect(logs[0].reqId).toBe("foo");
    expect(logs[0]).toMatchObject(defaultResLog);
  });
});

describe("on request", () => {
  it("basic", async () => {
    const { logs } = await mockRequest({
      onReqMessage: (c) => "Request received",
    });

    expect(logs).toHaveLength(2);
    expect(logs[0]).toMatchObject(defaultReqLog);
    expect(logs[1]).toMatchObject(defaultResLog);
  });

  it("custom log level", async () => {
    const { logs } = await mockRequest({
      onReqMessage: (c) => "Request received",
      onReqLevel: (c) => "debug",
    });

    expect(logs).toHaveLength(2);
    expect(logs[0]).toMatchObject({
      ...defaultReqLog,
      level: 20,
    });
    expect(logs[1]).toMatchObject(defaultResLog);
  });

  it("custom bindings", async () => {
    const { logs } = await mockRequest({
      onReqMessage: (c) => "Request received",
      onReqBindings: (c) => ({
        req: {
          url: c.req.path,
          method: c.req.method,
          headers: c.req.header(),
          foo: "bar",
        },
      }),
    });

    expect(logs).toHaveLength(2);
    expect(logs[0].req?.foo).toBe("bar");
    expect(logs[0]).toMatchObject(defaultReqLog);
    expect(logs[1]).toMatchObject(defaultResLog);
  });
});

describe("on response", () => {
  it("custom log level", async () => {
    const { logs } = await mockRequest({
      onResLevel: (c) => "debug",
    });

    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      ...defaultResLog,
      level: 20,
    });
  });

  it("custom bindings", async () => {
    const { logs } = await mockRequest({
      onResBindings: (c) => ({
        res: {
          status: c.res.status,
          headers: c.res.headers,
          foo: "bar",
        },
      }),
    });

    expect(logs).toHaveLength(1);
    expect(logs[0].res?.foo).toBe("bar");
    expect(logs[0]).toMatchObject(defaultResLog);
  });

  it("custom message", async () => {
    const { logs } = await mockRequest({
      onResMessage: (c) => "foo",
    });

    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      ...defaultResLog,
      msg: "foo",
    });
  });
});

describe("response time", () => {
  it("basic", async () => {
    const { logs } = await mockRequest();

    expect(logs).toHaveLength(1);
    expect(logs[0].responseTime).lt(1000);
  });

  it("disable", async () => {
    const { logs } = await mockRequest({
      responseTime: false,
    });

    expect(logs).toHaveLength(1);
    expect(logs[0].responseTime).toBeUndefined();
  });

  it("long time", async () => {
    const { logs, app } = createMockApp();
    app.get("/long-time", async (c) => {
      await sleep(1000);
      return c.text("ok");
    });

    const res = await app.request("/long-time");
    expect(res.status).toBe(200);
    expect(res.text()).resolves.toBe("ok");

    expect(logs).toHaveLength(1);
    expect(logs[0].responseTime).gte(1000);
  });
});

describe("contextKey option", () => {
  const pino1 = pino({ name: "pino1" });
  const pino2 = pino({ name: "pino2" });

  it("basic", async () => {
    const app = new Hono()
      .use(pinoLogger())
      .get("/", async (c) =>
        c.text(c.get("logger") instanceof PinoLogger ? "ok" : "fail", 200),
      );

    const res = await app.request("/");
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("ok");
  });

  it("multiple logger", async () => {
    const app = new Hono()
      .use(pinoLogger({ contextKey: "logger1" as const, pino: pino1 }))
      .use(pinoLogger({ contextKey: "logger2" as const, pino: pino2 }))
      .get("/", async (c) =>
        c.text(
          c.get("logger1")._logger.bindings().name === "pino1" &&
            c.get("logger2")._logger.bindings().name === "pino2"
            ? "ok"
            : "fail",
          200,
        ),
      );

    const res = await app.request("/");
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("ok");
  });
});
