import { it, expect } from "vitest";
import * as myPackage from "./index";

it("should have exports", () => {
  expect(myPackage).toEqual(expect.any(Object));
});

it("should not have undefined exports", () => {
  for (const k of Object.keys(myPackage))
    expect(myPackage).not.toHaveProperty(k, undefined);
});
