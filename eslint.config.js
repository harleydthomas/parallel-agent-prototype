import eslint from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  eslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: {
        console: "readonly",
        process: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        Buffer: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      "react-hooks": reactHooks,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Allow escape sequences in regex (needed for terminal control codes)
      "no-control-regex": "off",
      // Disable strict react-hooks rules that conflict with our patterns
      "react-hooks/exhaustive-deps": "warn",
      // These patterns are intentional in this codebase
      "react-hooks/rules-of-hooks": "error",
      // Allow setState in effects for resetting state on prop changes
      "react-hooks/set-state-in-effect": "off",
      // Allow ref access during render for synchronous change detection
      "react-hooks/refs": "off",
    },
  },
];
