# Project Tree Structure
```plaintext
.
|-- docs
|   |-- doc-project-config.md
|   |-- doc-project.md
|   `-- doc-project-tree.md
|-- script
|   `-- cw.sh
|-- src
|   |-- cli
|   |   `-- index.ts
|   |-- command
|   |   |-- cli
|   |   |   |-- CliCommandRegistry.ts
|   |   |   |-- CliExecutor.ts
|   |   |   `-- CliOptionPrompt.ts
|   |   |-- CommandDoc.ts
|   |   |-- CommandExit.ts
|   |   |-- CommandList.ts
|   |   `-- MasCLI.ts
|   |-- services
|   |   |-- serviceDocumentation
|   |   |   |-- index.ts
|   |   |   |-- ServiceContent.ts
|   |   |   |-- ServiceDocumentation.ts
|   |   |   |-- ServiceMarkdown.ts
|   |   |   |-- ServiceTree.ts
|   |   |   `-- types.ts
|   |   `-- serviceFileSystem
|   |       |-- FileSystemService.ts
|   |       `-- index.ts
|   `-- types
|       |-- command.ts
|       `-- zod.ts
|-- babel.config.js
|-- build.js
|-- documentation.md
|-- eslint.config.mjs
|-- .gitignore
|-- package.json
|-- package-lock.json
|-- .prettierrc
|-- README.md
|-- run.sh
`-- tsconfig.json

10 directories, 33 files
```
