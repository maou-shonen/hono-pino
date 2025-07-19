import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // environment: "edge-runtime", // runtime agnostic
    include: ["e2e/*.test.ts"],
  },
});
