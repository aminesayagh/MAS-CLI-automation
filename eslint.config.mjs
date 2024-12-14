import globals from "globals";
import pluginJs from "@eslint/js";

export default [
    
  // Base configuration and ignored paths
  {
    ignores: [
      "build.js",
      "dist/**/*",
      "node_modules/**/*",
      "coverage/**/*",
      "build/**/*",
      "*.js",
      "jest.config.js",
      "src/__mocks__/**/*",
      "eslint.config.mjs"
    ]
  },

  // Global configuration for all files
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest
      },
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: "latest",
        sourceType: "module"
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      "import": pluginImport,
      "promise": pluginPromise,
      "sonarjs": pluginSonarjs
    },
    settings: {
      "import/resolver": {
        typescript: true,
        node: true
      }
    }
  },

  // ESLint recommended rules
  pluginJs.configs.recommended,

  // TypeScript-specific configurations
  ...tseslint.configs.recommended,
  ...tseslint.configs.strict,
]