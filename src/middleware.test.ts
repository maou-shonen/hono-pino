import defu from "defu";
import { Hono } from "hono";
import { requestId } from "hono/request-id";
import { pino } from "pino";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PinoLogger } from "./logger";
import { createStaticRootLogger, pinoLogger } from "./middleware";
import type { Options } from "./types";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("nodeRuntime option coverage", () => {
  it("should use nodeRuntime=true", async () => {
    const app = new Hono()
      .use(pinoLogger({ nodeRuntime: true }))
      .get("/", (c) => c.text("ok"));
    const res = await app.request("/");
    expect(res.status).toBe(200);
  });

  it("should use nodeRuntime=false", async () => {
    const app = new Hono()
      .use(pinoLogger({ nodeRuntime: false }))
      .get("/", (c) => c.text("ok"));
    const res = await app.request("/");
    expect(res.status).toBe(200);
  });

  it("should use nodeRuntime='auto' (default)", async () => {
    const app = new Hono()
      .use(pinoLogger({ nodeRuntime: "auto" }))
      .get("/", (c) => c.text("ok"));
    const res = await app.request("/");
    expect(res.status).toBe(200);
  });

  it("should use nodeRuntime=undefined (default)", async () => {
    const app = new Hono().use(pinoLogger()).get("/", (c) => c.text("ok"));
    const res = await app.request("/");
    expect(res.status).toBe(200);
  });
});

describe("middleware", () => {
  let logs: Record<string, any>[];
  const pinoInstance = pino(
    { level: "trace", base: null, timestamp: false },
    {
      write: (data) => logs.push(JSON.parse(data)),
    },
  );

  beforeEach(() => {
    vi.unstubAllEnvs();
    logs = [];
  });

  const createMockApp = (logHttpOpts?: Options["http"]) => {
    const app = new Hono()
      .use(
        pinoLogger({
          pino: pinoInstance,
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

  describe("http logger", async () => {
    it("full disable", async () => {
      const { logs } = await mockRequest(false);

      expect(logs.length).toBe(0);
    });

    it("full default", async () => {
      const { logs } = await mockRequest();

      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({ ...defaultResLog });
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

    it("can be JSON serialize", async () => {
      const { app } = createMockApp();

      const res = await app.request("/");
      expect(res.status).toBe(200);
      expect(await res.text()).toBe("ok");
      expect(logs).toHaveLength(1);
      expect(() => JSON.stringify(logs[0])).not.toThrow();
    });

    it("with requestId middleware", async () => {
      const app = new Hono()
        .use(
          requestId({
            generator: () => "reqId",
          }),
          pinoLogger({
            pino: pinoInstance,
          }),
        )
        .get("/", (c) => c.text("ok"));

      const res = await app.request("/");

      expect(res.status).toBe(200);
      expect(await res.text()).toBe("ok");
      expect(logs).toHaveLength(1);
      expect(logs[0].reqId).toBe("reqId");
      expect(logs[0]).toMatchObject(defaultResLog);
    });

    it("custom referRequestIdKey", async () => {
      const app = new Hono<{ Variables: { customReqId: string } }>()
        .use(
          async (c, next) => {
            c.set("customReqId", "reqId");
            await next();
          },
          pinoLogger({
            pino: pinoInstance,
            http: {
              referRequestIdKey: "customReqId",
            },
          }),
        )
        .get("/", (c) => c.text("ok"));

      const res = await app.request("/");

      expect(res.status).toBe(200);
      expect(await res.text()).toBe("ok");
      expect(logs).toHaveLength(1);
      expect(logs[0].reqId).toBe("reqId");
      expect(logs[0]).toMatchObject(defaultResLog);
    });
  });

  describe("pino option", () => {
    const createApp = (opts?: Options) => {
      const app = new Hono().use(pinoLogger(opts));
      app.get("/hello", async (c) => {
        c.var.logger.info("hello");
        return c.text("ok");
      });
      app.get("/bindings", async (c) => c.json(c.var.logger.bindings()));
      app.get("/log-level", async (c) =>
        c.json(c.var.logger._rootLogger.level),
      );
      return app;
    };

    it("default with set env", async () => {
      const app = createApp();

      vi.stubEnv("LOG_LEVEL", "debug");
      const res = await app.request("/log-level");
      expect(res.status).toBe(200);
      expect(await res.json()).toBe("debug");
    });

    it("default with default value", async () => {
      const app = createApp();

      const res = await app.request("/log-level");
      expect(res.status).toBe(200);
      expect(await res.json()).toBe("info");
    });

    it("a pino logger", async () => {
      const app = createApp({
        pino: pino({
          name: "pino",
        }),
      });

      const res = await app.request("/bindings");
      expect(res.status).toBe(200);
      expect(await res.json()).toMatchObject({ name: "pino" });
    });

    it("a pino options", async () => {
      const app = createApp({
        pino: {
          name: "pino",
        },
      });

      const res = await app.request("/bindings");
      expect(res.status).toBe(200);
      expect(await res.json()).toMatchObject({ name: "pino" });
    });

    it("dynamic pino logger", async () => {
      const app = createApp({
        pino: (c) => pino({ level: c.env.LOG_LEVEL }),
      });

      const res = await app.request("/log-level", undefined, {
        LOG_LEVEL: "debug",
      });
      expect(res.status).toBe(200);
      expect(await res.json()).toBe("debug");
    });

    it("dynamic pino child options", async () => {
      const app = createApp({
        pino: (c) => ({ level: c.env.LOG_LEVEL }),
      });

      const res = await app.request("/log-level", undefined, {
        LOG_LEVEL: "debug",
      });
      expect(res.status).toBe(200);
      expect(await res.json()).toBe("debug");
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

    it("async message function", async () => {
      const { logs } = await mockRequest({
        onReqMessage: async (c) => {
          await sleep(10); // Simulate async operation
          return "Async request received";
        },
      });

      expect(logs).toHaveLength(2);
      expect(logs[0]).toMatchObject({
        ...defaultReqLog,
        msg: "Async request received",
      });
      expect(logs[1]).toMatchObject(defaultResLog);
    });

    it("onReqBindings should be available in the logger", async () => {
      const { app } = createMockApp({
        onReqBindings: (_) => ({ foo: "bar" }),
      });
      app.get("/bindings", async (c) => c.json(c.var.logger.bindings()));

      const res = await app.request("/bindings");
      expect(res.status).toBe(200);
      expect(await res.json()).toMatchObject({
        foo: "bar",
      });
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

    it("async message function", async () => {
      const { logs } = await mockRequest({
        onResMessage: async (c) => {
          await sleep(10); // Simulate async operation
          return "Async response completed";
        },
      });

      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        ...defaultResLog,
        msg: "Async response completed",
      });
    });

    it("Override response log message", async () => {
      const { logs, app } = createMockApp();
      app.get("/override-message", async (c) => {
        c.get("logger").setResMessage("foo");
        return c.text("ok");
      });

      const res = await app.request("/override-message");
      expect(res.status).toBe(200);
      expect(res.text()).resolves.toBe("ok");

      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject(
        defu(
          {
            req: {
              url: "/override-message",
            },
            msg: "foo",
          },
          defaultResLog,
        ),
      );
    });

    it("Override response log level", async () => {
      const { logs, app } = createMockApp();
      app.get("/override-level", async (c) => {
        c.get("logger").setResLevel("debug");
        return c.text("ok");
      });

      const res = await app.request("/override-level");
      expect(res.status).toBe(200);
      expect(res.text()).resolves.toBe("ok");

      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject(
        defu(
          {
            req: {
              url: "/override-level",
            },
            level: 20,
          },
          defaultResLog,
        ),
      );
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

    it("should set logger to default contextKey when opts is undefined", async () => {
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

  describe("createStaticRootLogger fallback", () => {
    it("should use createConsoleDestinationStream when opt is undefined and not nodeRuntime and not pinoTransport", () => {
      // nodeRuntime = false, opt = undefined
      const logger = createStaticRootLogger(undefined, false);
      expect(logger).toBeDefined();
      expect(typeof logger!.info).toBe("function");
    });
  });
});
