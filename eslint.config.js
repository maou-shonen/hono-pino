import core from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import { configs as unicornConfigs } from "eslint-plugin-unicorn";
import { config, configs as typescriptConfigs } from "typescript-eslint";

export default config(
  {
    ignores: ["dist", "examples", "eslint.config.js"],
  },
  core.configs.recommended,
  ...typescriptConfigs.strictTypeChecked,
  ...typescriptConfigs.stylisticTypeChecked,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access -- I don't know why typing is broken for unicorn...
  unicornConfigs["flat/recommended"],
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
