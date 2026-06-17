import { defineConfig, globalIgnores } from "eslint/config";
import { FlatCompat } from "@eslint/eslintrc";

// Bridge legacy eslint-config-next (ESLint 8 format) into ESLint 9 flat config.
// eslint-config-next@15 does not natively export flat config arrays; FlatCompat
// wraps the legacy { extends: [...] } shape into flat-config-compatible objects.
const compat = new FlatCompat();

const eslintConfig = defineConfig([
  ...compat.extends("next/core-web-vitals"),
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
