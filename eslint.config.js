import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    files: ["*.ts"],
  },
  {
    ignores: ["dist", "examples", "coverage", "node_modules", "**/*.test.ts"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "unicorn/prevent-abbreviations": "off",
    },
  },
);
