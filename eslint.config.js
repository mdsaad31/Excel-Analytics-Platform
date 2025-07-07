import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginReactRefresh from "eslint-plugin-react-refresh";

export default [
  {
    ignores: ["dist"],
  },
  {
    files: ["**/*.{js,jsx}"],
    ...pluginJs.configs.recommended,
    ...pluginReactConfig,
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "react-hooks": pluginReactHooks,
      "react-refresh": pluginReactRefresh,
    },
    rules: {
      "no-unused-vars": ["error", { "varsIgnorePattern": "^[A-Z_]" }],
      "no-undef": "error",
      "react/jsx-no-undef": "error",
      "react/jsx-no-duplicate-props": "error",
      "react/no-direct-mutation-state": "error",
      "react-hooks/rules-of-hooks": "error",
      "react-refresh/only-export-components": [
        "warn",
        { "allowConstantExport": true },
      ],
    },
  },
];