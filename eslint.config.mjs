import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginImport from "eslint-plugin-import";
import pluginPromise from "eslint-plugin-promise";
import pluginSonarjs from "eslint-plugin-sonarjs";

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

  // Custom rules overrides add additions
  {
    rules: {
        
      // Promise Rules
      "promise/always-return": "error",
      "promise/no-return-wrap": "error",
      "promise/param-names": "error",
      "promise/catch-or-return": "error",
      "promise/no-new-statics": "error",
      "promise/no-return-in-finally": "error",
      "promise/valid-params": "error",

      
      // SonarJS Rules
      "sonarjs/no-identical-functions": "error",
      "sonarjs/no-duplicate-string": ["error", { "threshold": 3 }],
      "sonarjs/cognitive-complexity": ["error", 15],
      "sonarjs/no-redundant-jump": "error",
      "sonarjs/no-small-switch": "error",
      "sonarjs/prefer-immediate-return": "error",
      "sonarjs/no-nested-template-literals": "error",

      
      // TypeScript-specific rules
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["error", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_"
      }],
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "interface",
          format: ["PascalCase"],
          prefix: ["I"]
        },
        {
          selector: "typeAlias",
          format: ["PascalCase"]
        },

        {
          selector: "class",
          format: ["PascalCase"]
        },
        {
          selector: "method",
          format: ["camelCase"]
        },
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE"],
          leadingUnderscore: "allow"
        }
      ],

      "@typescript-eslint/explicit-member-accessibility": ["warn", {
        accessibility: "explicit"
      }],
      "@typescript-eslint/method-signature-style": ["error", "property"],
      "@typescript-eslint/member-ordering": ["error", {
        default: [
          "public-static-field",
          "protected-static-field",
          "private-static-field",
          "public-instance-field",
          "protected-instance-field",
          "private-instance-field",
          "constructor",
          "public-method",
          "protected-method",
          "private-method"
        ]
      }],
    }
  }
]