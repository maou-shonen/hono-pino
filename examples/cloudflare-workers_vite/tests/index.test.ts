import { describe, expect, it } from "vitest";
import app from "../src";

describe("Hono app", () => {
  it("should respond with 'Hello!'", async () => {
    const res = await app.request("/");
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("hello world");
  });
});
