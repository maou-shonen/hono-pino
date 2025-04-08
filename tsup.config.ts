import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/debug-log/index.ts"],
  splitting: false,
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  minify: false,
  platform: "node",
});
