import core from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import { config, configs as typescriptConfigs } from "typescript-eslint";

export default config(
  {
    ignores: [
      "dist",
      "examples",
      "eslint.config.js",
      "**/*.test.ts",
      "coverage",
    ],
  },
  core.configs.recommended,
  ...typescriptConfigs.strictTypeChecked,
  prettierConfig,
  {
    languageOptions: {
      parserOptions: {
        project: true,
      },
    },
  },
  {
    rules: {
      "unicorn/prevent-abbreviations": "off",
    },
  },
);
