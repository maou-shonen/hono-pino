import { it, expect } from "vitest";
import * as myPackage from "./index";

it("should have exports", () => {
  expect(myPackage).toEqual(expect.any(Object));
});

it("should not have undefined exports", () => {
  expect(myPackage).toHaveProperty("logger");
  expect(myPackage).toHaveProperty("pinoLogger");
  expect(myPackage).toHaveProperty("PinoLogger");
  expect(myPackage).toHaveProperty("getLogger");
});
