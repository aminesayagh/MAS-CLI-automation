# Code Documentation
Generated on: 2025-01-22T12:32:28.915Z


## Project Structure

```
└── mas
    ├── README.md
    ├── babel.config.js
    ├── eslint.config.mjs
    ├── package.json
    ├── run.sh
    └── tsconfig.json
```

Path: /root/git/mas/README.md
```md
# MAS CLI
A powerful CLI automation tool for developers, focused on streamlining development workflows and documentation generation.
## Features
- 📝 **Documentation Generation**: Automatically generate comprehensive documentation for your codebase
- 📂 **File System Operations**: Intuitive file listing and management
- 🎨 **Interactive Interface**: User-friendly CLI with interactive menus
- ⚙️ **Flexible Configuration**: Customizable options for each command
## Installation
```bash
npm install -g mas
```
Requires Node.js version 18 or higher.
## Usage
You can use MAS CLI in two ways:
### 1. Interactive Mode
Simply run:
```bash
mas
```
This will launch an interactive menu where you can select commands and options.
### 2. Command Line Mode
Run specific commands directly:
```bash
mas <command> [options]
```
## Available Commands
### Documentation Generation (`doc`)
Generate documentation for your project:
```bash
mas doc [options]
```
Options:
- `-p, --pattern <pattern>`: File pattern to match (default: "\.ts$")
- `-o, --output <path>`: Output file path (default: "documentation.md")
- `-e, --exclude <patterns...>`: Patterns to exclude (default: ["node_modules", "dist"])
- `-c, --compress`: Compress output by removing empty lines and comments
- `-s, --max-size <size>`: Maximum file size to process (e.g., "1MB")
Example:
```bash
mas doc --pattern "\.ts$" --output "docs/api.md" --exclude node_modules dist --max-size 2MB
```
### List Files (`list`)
List files in the current directory:
```bash
mas list [options]
```
Options:
- `-a, --all`: Show hidden files
### Exit (`exit`)
Exit the CLI:
```bash
mas exit
```
## Project Structure
```
└── mas
└── src
├── cli
│   └── index.ts
├── command
│   ├── CommandDoc.ts
│   ├── CommandExit.ts
│   ├── CommandList.ts
│   └── MasCLI.ts
├── services
│   ├── serviceDocumentation
│   └── serviceFileSystem
└── types
```
## Configuration
The CLI comes with sensible defaults but can be customized for each command. Key configuration options include:
- Documentation generation patterns
- File size limits
- Output formatting
- Directory exclusion patterns
## Development
To set up the development environment:
1. Clone the repository:
```bash
git clone https://github.com/aminesayagh/mas.git
cd mas
```
2. Install dependencies:
```bash
npm install
```
3. Available scripts:
```bash
npm run build        # Build the project
npm run start       # Run the CLI
npm run typecheck   # Run TypeScript type checking
npm run lint        # Run linting
npm run format      # Format code
npm run ci          # Run all checks and build
```
## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
## License
This project is licensed under the ISC License - see the LICENSE file for details.
## Author
Mohamed Amine SAYAGH - [Website](https://masayagh.com)
## Links
- [Homepage](https://masayagh.com)
- [GitHub Repository](https://github.com/aminesayagh/mas)
- [Issue Tracker](https://github.com/aminesayagh/mas/issues)
```

Path: /root/git/mas/babel.config.js
```js
module.exports = {
presets: [
['@babel/preset-env', { targets: { node: 'current' } }],
'@babel/preset-typescript',
],
};
```

Path: /root/git/mas/eslint.config.mjs
```mjs
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginImport from "eslint-plugin-import";
import pluginPromise from "eslint-plugin-promise";
import pluginSonarjs from "eslint-plugin-sonarjs";
export default [
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
pluginJs.configs.recommended,
...tseslint.configs.recommended,
...tseslint.configs.strict,
{
rules: {
"promise/always-return": "error",
"promise/no-return-wrap": "error",
"promise/param-names": "error",
"promise/catch-or-return": "error",
"promise/no-new-statics": "error",
"promise/no-return-in-finally": "error",
"promise/valid-params": "error",
"sonarjs/no-identical-functions": "error",
"sonarjs/cognitive-complexity": ["error", 15],
"sonarjs/no-redundant-jump": "error",
"sonarjs/no-small-switch": "error",
"sonarjs/prefer-immediate-return": "error",
"sonarjs/no-nested-template-literals": "error",
"@typescript-eslint/explicit-function-return-type": "warn",
"@typescript-eslint/no-explicit-any": "warn",
"@typescript-eslint/no-extraneous-class": "off",
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
```

Path: /root/git/mas/package.json
```json
{
"name": "cw",
"version": "1.0.0",
"description": "CLI automation with AI, for developers",
"main": "index.js",
"engines": {
"node": ">=18.x"
},
"scripts": {
"start": "node dist/index.js",
"build": "node build.js",
"format": "prettier --write \"src/**/*.ts\"",
"lint": "eslint .",
"typecheck": "tsc --noEmit",
"build:start": "node build.js && node dist/index.js",
"format:check": "prettier --check \"src/**/*.ts\"",
"lint:fix": "eslint --fix .",
"fix": "npm run lint:fix && npm run format",
"ci": "npm run typecheck && npm run lint && npm run format:check"
},
"bin": {
"cw": "./dist/index.js"
},
"author": "Mohamed Amine SAYAGH",
"homepage": "https://masayagh.com",
"repository": {
"type": "git",
"url": "https://github.com/aminesayagh/mas"
},
"license": "ISC",
"devDependencies": {
"@babel/core": "^7.25.2",
"@babel/preset-env": "^7.25.4",
"@babel/preset-typescript": "^7.24.7",
"@types/inquirer": "^9.0.7",
"eslint": "^9.17.0",
"eslint-plugin-promise": "^7.2.1",
"globals": "^15.13.0",
"prettier": "^3.4.2",
"ts-node": "^10.9.2",
"typescript": "^5.7.2",
"typescript-eslint": "^8.18.0"
},
"dependencies": {
"colors": "^1.4.0",
"commander": "^12.1.0",
"esbuild": "^0.24.0",
"esbuild-plugin-typescript": "^2.0.0",
"eslint-plugin-import": "^2.31.0",
"eslint-plugin-sonarjs": "^3.0.1",
"global": "^4.4.0",
"inquirer": "^12.2.0",
"mark-parse": "^2.1.0",
"remark": "^15.0.1",
"remark-stringify": "^11.0.0",
"unified": "^11.0.5",
"unist-util-visit": "^5.0.0",
"zod": "^3.24.1"
}
}
```

Path: /root/git/mas/run.sh
```sh
#!/bin/bash
npm run fix && npm run ci && npm run build && npm install -g .
cw
```

Path: /root/git/mas/tsconfig.json
```json
{
"compilerOptions": {
"target": "ES2017",
"module": "ESNext",
"lib": ["ES2017", "ES2018", "ES2019", "ES2020", "ES2021", "ES2022", "ES2023"],
"moduleResolution": "node",
"outDir": "./dist",
"rootDir": "./src",
"strict": true,
"noImplicitAny": true,
"strictNullChecks": true,
"resolveJsonModule": true,
"strictFunctionTypes": true,
"strictBindCallApply": true,
"strictPropertyInitialization": true,
"noImplicitThis": true,
"alwaysStrict": true,
"noUnusedLocals": true,
"noUnusedParameters": true,
"noImplicitReturns": true,
"noFallthroughCasesInSwitch": true,
"noUncheckedIndexedAccess": true,
"noImplicitOverride": true,
"noPropertyAccessFromIndexSignature": true,
"esModuleInterop": true,
"forceConsistentCasingInFileNames": true,
"skipLibCheck": true
},
"include": ["src/**/*"],
"exclude": ["node_modules", "**/*.spec.ts"]
}
```