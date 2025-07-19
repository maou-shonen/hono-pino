import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "edge-runtime", // runtime agnostic
    include: ["src/**/*.test.ts", "examples/**/*.test.ts"],
    coverage: {
      enabled: true,
      include: ["src/**/*.ts"],
    },
  },
});
