# Code Documentation
Generated on: 2024-12-14T10:55:27.470Z
Total files: 8

## Project Structure

```
└── mas
    ├── documentation
    └── src
        ├── cli
        │   └── index.ts
        ├── command
        │   ├── CommandDoc.ts
        │   ├── CommandExit.ts
        │   ├── CommandList.ts
        │   └── MasCLI.ts
        ├── services
        │   └── serviceDocumentation
        │       ├── DocumentationService.ts
        │       └── types.ts
        └── types
            └── command.ts
```

## File: index.ts
- Path: `/root/git/mas/src/cli/index.ts`
- Size: 288.00 B
- Extension: .ts
- Lines of code: 11

```ts
 1 | #!/usr/bin/env node
 2 | 
 3 | import { MasCLI } from "../command/MasCLI";
 4 | import colors from "colors";
 5 | async function main(): Promise<void> {
 6 |   const mas = new MasCLI();
 7 |   await mas.run();
 8 | }
 9 | 
10 | main().catch(error => {
11 |   console.error(colors.red("An error occurred:"), error);
12 |   process.exit(1);
13 | });
14 | 
```

---------------------------------------------------------------------------

## File: CommandDoc.ts
- Path: `/root/git/mas/src/command/CommandDoc.ts`
- Size: 2.71 KB
- Extension: .ts
- Lines of code: 83

```ts
 1 | import { Command } from "commander";
 2 | import colors from "colors";
 3 | 
 4 | import { IBaseCommand } from "../types/command";
 5 | 
 6 | import { DocumentationService } from "../services/serviceDocumentation/DocumentationService";
 7 | export interface ICommandOptionsDoc {
 8 |   pattern?: string;
 9 |   output?: string;
10 |   exclude?: string[];
11 |   compress?: boolean;
12 |   maxSize?: string;
13 | }
14 | 
15 | export class CommandDoc implements IBaseCommand<ICommandOptionsDoc> {
16 |   public command: Command;
17 | 
18 |   public constructor() {
19 |     this.command = new Command("doc");
20 |   }
21 | 
22 |   public configure(): void {
23 |     this.command
24 |       .description("Generate documentation for the current project")
25 |       .option(
26 |         "-p, --pattern <pattern>",
27 |         "File pattern to match (e.g., \\.ts$)",
28 |         "\\.ts$"
29 |       )
30 |       .option("-o, --output <path>", "Output file path", "documentation.md")
31 |       .option("-e, --exclude <patterns...>", "Patterns to exclude", [
32 |         "node_modules",
33 |         "dist"
34 |       ])
35 |       .option(
36 |         "-c, --compress",
37 |         "Compress output by removing empty lines and comments",
38 |         false
39 |       )
40 |       .option(
41 |         "-s, --max-size <size>",
42 |         "Maximum file size to process (e.g., 1MB)",
43 |         "1MB"
44 |       );
45 |   }
46 | 
47 |   public async execute(options: ICommandOptionsDoc): Promise<void> {
48 |     try {
49 |       console.log(colors.cyan("\nGenerating documentation..."));
50 | 
51 |       const documentationService = new DocumentationService({
52 |         pattern: new RegExp(options.pattern || "\\.ts$"),
53 |         outputPath: options.output || "documentation.md",
54 |         excludePatterns: options.exclude || ["node_modules", "dist"],
55 |         compress: options.compress || false,
56 |         maxFileSize: CommandDoc.parseMaxSize(options.maxSize || "1MB"),
57 |         rootDir: process.cwd(),
58 |         ignoreHidden: true
59 |       });
60 |       await documentationService.run();
61 | 
62 |       console.log(colors.green("\nDocumentation generated successfully!"));
63 |       console.log(
64 |         colors.cyan(`Output file: ${options.output || "documentation.md"}\n`)
65 |       );
66 |     } catch (error: unknown) {
67 |       console.error(
68 |         colors.red("\nError generating documentation:"),
69 |         (error as Error).message
70 |       );
71 |       throw error;
72 |     }
73 |   }
74 | 
75 |   public static parseMaxSize(size: string): number {
76 |     const units = { B: 1, KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 };
77 |     const match = size.match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)$/i);
78 | 
79 |     if (!match) {
80 |       throw new Error(
81 |         "Invalid size format. Use format: number + unit (e.g., 1MB)"
82 |       );
83 |     }
84 | 
85 |     const [, value, unit] = match;
86 |     if (!unit) {
87 |       throw new Error("Unit is required");
88 |     }
89 |     if (!value) {
90 |       throw new Error("Value is required");
91 |     }
92 |     return parseFloat(value) * units[unit.toUpperCase() as keyof typeof units];
93 |   }
94 | }
95 | 
```

---------------------------------------------------------------------------

## File: CommandExit.ts
- Path: `/root/git/mas/src/command/CommandExit.ts`
- Size: 558.00 B
- Extension: .ts
- Lines of code: 18

```ts
 1 | import { Command } from "commander";
 2 | import { IBaseCommand } from "../types/command";
 3 | 
 4 | export interface ICommandOptionsExit {
 5 |   message?: string;
 6 | }
 7 | 
 8 | export class CommandExit implements IBaseCommand<ICommandOptionsExit> {
 9 |   public command: Command;
10 | 
11 |   public constructor() {
12 |     this.command = new Command("exit");
13 |   }
14 | 
15 |   public configure(): void {
16 |     this.command.description("Exit the CLI");
17 |   }
18 | 
19 |   public execute(options: ICommandOptionsExit): void {
20 |     console.log(options.message || "Thank you for using MAS CLI. Goodbye!");
21 |     process.exit(0);
22 |   }
23 | }
24 | 
```

---------------------------------------------------------------------------

## File: CommandList.ts
- Path: `/root/git/mas/src/command/CommandList.ts`
- Size: 2.32 KB
- Extension: .ts
- Lines of code: 73

```ts
 1 | import { Command } from "commander";
 2 | import colors from "colors";
 3 | import { readdirSync, statSync } from "fs";
 4 | import { join } from "path";
 5 | 
 6 | import { IBaseCommand } from "../types/command";
 7 | 
 8 | interface IFileInfo {
 9 |   name: string;
10 |   isDirectory: boolean;
11 |   size: number;
12 |   lastModified: Date;
13 | }
14 | 
15 | export interface ICommandOptionsList {
16 |   all: boolean;
17 | }
18 | 
19 | export class CommandList implements IBaseCommand<ICommandOptionsList> {
20 |   public command: Command;
21 | 
22 |   public constructor() {
23 |     this.command = new Command("list");
24 |     this.configure();
25 |   }
26 | 
27 |   public configure(): void {
28 |     this.command
29 |       .description("List files in the current directory")
30 |       .option("-a, --all", "Show hidden files", false);
31 |   }
32 | 
33 |   public execute(options: ICommandOptionsList): void {
34 |     try {
35 |       const currentDir = process.cwd();
36 |       const files = readdirSync(currentDir);
37 | 
38 |       const fileInfos = files
39 |         .filter(file => options.all || !file.startsWith("."))
40 |         .map(file => CommandList.getFileInfo(join(currentDir, file)))
41 |         .sort((a, b) => {
42 |           if (a.isDirectory !== b.isDirectory) {
43 |             return a.isDirectory ? -1 : 1;
44 |           }
45 |           return a.name.localeCompare(b.name);
46 |         });
47 | 
48 |       console.log(colors.cyan("\nCurrent directory contents:\n"));
49 | 
50 |       const output = fileInfos.map(file => {
51 |         const name = file.isDirectory
52 |           ? colors.blue(`${file.name}/`)
53 |           : file.name;
54 | 
55 |         return `${name.padEnd(40)} ${colors.yellow(
56 |           CommandList.formatSize(file.size).padEnd(10)
57 |         )} ${colors.green(file.lastModified.toLocaleDateString())}`;
58 |       });
59 | 
60 |       console.log(output.join("\n"));
61 |       console.log(colors.cyan(`\nTotal: ${fileInfos.length} items\n`));
62 |     } catch (error) {
63 |       console.error(colors.red("Error listing files:"), error);
64 |     }
65 |   }
66 | 
67 |   public static formatSize(size: number): string {
68 |     const units = ["B", "KB", "MB", "GB"];
69 |     let unitIndex = 0;
70 |     let fileSize = size;
71 | 
72 |     while (fileSize >= 1024 && unitIndex < units.length - 1) {
73 |       fileSize /= 1024;
74 |       unitIndex++;
75 |     }
76 | 
77 |     return `${fileSize.toFixed(1)} ${units[unitIndex]}`;
78 |   }
79 | 
80 |   public static getFileInfo(filePath: string): IFileInfo {
81 |     const stats = statSync(filePath);
82 |     return {
83 |       name: filePath,
84 |       isDirectory: stats.isDirectory(),
85 |       size: stats.size,
86 |       lastModified: stats.mtime
87 |     };
88 |   }
89 | }
90 | 
```

---------------------------------------------------------------------------

## File: MasCLI.ts
- Path: `/root/git/mas/src/command/MasCLI.ts`
- Size: 4.22 KB
- Extension: .ts
- Lines of code: 139

```ts
  1 | import { Command } from "commander";
  2 | import colors from "colors";
  3 | import inquirer from "inquirer";
  4 | 
  5 | import { CommandList } from "./CommandList";
  6 | import { CommandExit } from "./CommandExit";
  7 | import { CommandDoc } from "./CommandDoc";
  8 | 
  9 | import { IBaseCommand, CommandRegistry } from "../types/command";
 10 | export class MasCLI {
 11 |   private program: Command;
 12 |   private commandRegistry: CommandRegistry;
 13 | 
 14 |   public constructor() {
 15 |     this.program = new Command();
 16 |     this.commandRegistry = new Map();
 17 |     this.initialize();
 18 |   }
 19 | 
 20 |   public async run(): Promise<void> {
 21 |     try {
 22 |       if (process.argv.length <= 2) {
 23 |         await this.showInteractiveMenu();
 24 |       } else {
 25 |         this.program.parse(process.argv);
 26 | 
 27 |         await this.showInteractiveMenu(false);
 28 |       }
 29 |     } catch (error) {
 30 |       console.error(colors.red("An error occurred:"), error);
 31 |       process.exit(1);
 32 |     }
 33 |   }
 34 | 
 35 |   private initialize(): void {
 36 |     this.program
 37 |       .name("mas")
 38 |       .description("CLI automation tools for developers")
 39 |       .version("0.0.1");
 40 | 
 41 |     // Register all commands
 42 |     this.registerCommand<{ all: boolean }>(new CommandList());
 43 |     this.registerCommand(new CommandDoc());
 44 |     this.registerCommand(new CommandExit());
 45 | 
 46 |     // Add help text for when no command is provided
 47 |     this.program.on("command:*", () => {
 48 |       console.error(
 49 |         colors.red(
 50 |           "Invalid command: %s\nSee --help for a list of available commands."
 51 |         ),
 52 |         this.program.args.join(" ")
 53 |       );
 54 |       this.showInteractiveMenu();
 55 |     });
 56 |   }
 57 | 
 58 |   private registerCommand<T>(command: IBaseCommand<T>): void {
 59 |     this.commandRegistry.set(command.command.name(), {
 60 |       command: command.command,
 61 |       execute: command.execute as (options: unknown) => Promise<void>
 62 |     });
 63 |     this.program.addCommand(command.command);
 64 |   }
 65 | 
 66 |   private async showInteractiveMenu(withHello: boolean = true): Promise<void> {
 67 |     if (withHello) {
 68 |       console.log(
 69 |         colors.yellow(
 70 |           "\nWelcome to MAS CLI - Your Development Workflow Assistant\n"
 71 |         )
 72 |       );
 73 |     }
 74 | 
 75 |     const choices = Array.from(this.commandRegistry.entries()).map(
 76 |       ([name, info]) => ({
 77 |         name: `${colors.cyan(name.padEnd(15))} ${info.command.description()}`,
 78 |         value: name
 79 |       })
 80 |     );
 81 | 
 82 |     const { selectedCommand } = await inquirer.prompt([
 83 |       {
 84 |         type: "list",
 85 |         name: "selectedCommand",
 86 |         message: "Please select a command to execute:",
 87 |         choices,
 88 |         pageSize: 10
 89 |       }
 90 |     ]);
 91 | 
 92 |     const commandInfo = this.commandRegistry.get(selectedCommand);
 93 |     if (commandInfo) {
 94 |       const { command } = commandInfo;
 95 | 
 96 |       try {
 97 |         // If command needs additional options, prompt for them
 98 |         if (command.options.length > 0) {
 99 |           const options = await this.promptCommandOptions(command);
100 |           await commandInfo.execute?.(options);
101 | 
102 |           await this.showInteractiveMenu(false);
103 |         } else {
104 |           await commandInfo.execute?.({});
105 |         }
106 | 
107 |         const { shouldContinue } = await inquirer.prompt([
108 |           {
109 |             type: "confirm",
110 |             name: "shouldContinue",
111 |             message: "Do you want to continue?",
112 |             default: true
113 |           }
114 |         ]);
115 | 
116 |         if (!shouldContinue) {
117 |           console.log(
118 |             colors.yellow("\nThank you for using MAS CLI. Goodbye!\n")
119 |           );
120 |           process.exit(0);
121 |         }
122 |       } catch (error) {
123 |         console.error(
124 |           colors.red("\nAn error occurred while executing the command:"),
125 |           error
126 |         );
127 |         await new Promise(resolve => setTimeout(resolve, 2000)); // Pause to show error
128 |       }
129 |     }
130 |   }
131 | 
132 |   private async promptCommandOptions(
133 |     command: Command
134 |   ): Promise<ReturnType<typeof inquirer.prompt>> {
135 |     const questions = command.options.map(option => {
136 |       const question: {
137 |         [x: string]: any;
138 |       } = {
139 |         name: option.attributeName(),
140 |         message: option.description
141 |       };
142 | 
143 |       if (option.mandatory) {
144 |         question["type"] = "input";
145 |         question["validate"] = (input: string) => input.length > 0;
146 |       } else {
147 |         question["type"] = "confirm";
148 |         question["default"] = option.defaultValue;
149 |       }
150 | 
151 |       return question;
152 |     });
153 | 
154 |     return inquirer.prompt(
155 |       questions as {
156 |         [x: string]: any;
157 |       }
158 |     );
159 |   }
160 | }
161 | 
```

---------------------------------------------------------------------------

## File: command.ts
- Path: `/root/git/mas/src/types/command.ts`
- Size: 336.00 B
- Extension: .ts
- Lines of code: 11

```ts
 1 | import { Command } from "commander";
 2 | 
 3 | export interface IBaseCommand<T> {
 4 |   command: Command;
 5 |   configure: () => void;
 6 |   execute: (options: T) => Promise<void> | void;
 7 | }
 8 | 
 9 | export interface ICommandInfo<T> {
10 |   command: Command;
11 |   execute: (options: T) => Promise<void>;
12 | }
13 | 
14 | export type CommandRegistry = Map<string, ICommandInfo<unknown>>;
15 | 
```

---------------------------------------------------------------------------

## File: DocumentationService.ts
- Path: `/root/git/mas/src/services/serviceDocumentation/DocumentationService.ts`
- Size: 5.79 KB
- Extension: .ts
- Lines of code: 172

```ts
  1 | import * as fs from "fs/promises";
  2 | import * as path from "path";
  3 | 
  4 | import { IDocumentationConfig, IFileInfo, ITreeNode } from "./types";
  5 | 
  6 | export class DocumentationService {
  7 |   private static readonly DEFAULT_CONFIG: IDocumentationConfig = {
  8 |     pattern: /.*/,
  9 |     rootDir: process.cwd(),
 10 |     outputPath: "documentation.md",
 11 |     excludePatterns: ["node_modules/**", "**/dist/**", "**/*.test.ts"],
 12 |     maxFileSize: 1024 * 1024,
 13 |     ignoreHidden: true,
 14 |     compress: false
 15 |   };
 16 | 
 17 |   private config: IDocumentationConfig;
 18 | 
 19 |   public constructor(config: Partial<IDocumentationConfig> = {}) {
 20 |     this.config = { ...DocumentationService.DEFAULT_CONFIG, ...config };
 21 |   }
 22 | 
 23 |   public async run(): Promise<void> {
 24 |     try {
 25 |       const files: IFileInfo[] = [];
 26 |       const rootNode = await this.createTreeNode(this.config.rootDir);
 27 | 
 28 |       if (!rootNode) {
 29 |         throw new Error("Root directory not found");
 30 |       }
 31 | 
 32 |       const queue = [this.config.rootDir];
 33 |       while (queue.length > 0) {
 34 |         const currentPath = queue.shift();
 35 |         if (!currentPath) continue;
 36 |         const stats = await fs.stat(currentPath);
 37 | 
 38 |         if (stats.isDirectory()) {
 39 |           const entries = await fs.readdir(currentPath);
 40 |           queue.push(...entries.map(entry => path.join(currentPath, entry)));
 41 |         } else if (
 42 |           this.isMatchingFile(currentPath) &&
 43 |           stats.size <= this.config.maxFileSize
 44 |         ) {
 45 |           files.push(await this.generateFileInfo(currentPath));
 46 |         }
 47 |       }
 48 | 
 49 |       const treeContent = this.renderTree(rootNode);
 50 |       const markdown = this.generateMarkdown(files, treeContent);
 51 |       await fs.writeFile(this.config.outputPath, markdown, "utf-8");
 52 |     } catch (error) {
 53 |       console.error(error);
 54 |     }
 55 |   }
 56 | 
 57 |   private async createTreeNode(
 58 |     nodePath: string,
 59 |     relativePath = ""
 60 |   ): Promise<ITreeNode | null> {
 61 |     const stats = await fs.stat(nodePath);
 62 |     const name = path.basename(nodePath);
 63 | 
 64 |     if (!this.shouldInclude(nodePath)) return null;
 65 | 
 66 |     if (stats.isDirectory()) {
 67 |       const entries = await fs.readdir(nodePath, { withFileTypes: true });
 68 |       const children: ITreeNode[] = [];
 69 | 
 70 |       for (const entry of entries) {
 71 |         const childNode = await this.createTreeNode(
 72 |           path.join(nodePath, entry.name),
 73 |           path.join(relativePath, name)
 74 |         );
 75 |         if (childNode) children.push(childNode);
 76 |       }
 77 | 
 78 |       return { name, path: relativePath || name, type: "directory", children };
 79 |     }
 80 | 
 81 |     if (this.isMatchingFile(nodePath)) {
 82 |       return { name, path: relativePath || name, type: "file", children: [] };
 83 |     }
 84 | 
 85 |     return null;
 86 |   }
 87 | 
 88 |   private shouldInclude(filePath: string): boolean {
 89 |     if (this.config.ignoreHidden && this.isHidden(filePath)) return false;
 90 | 
 91 |     return !this.config.excludePatterns.some(pattern =>
 92 |       new RegExp(pattern.replace(/\*/g, ".*")).test(filePath)
 93 |     );
 94 |   }
 95 | 
 96 |   private isHidden(filePath: string): boolean {
 97 |     return path.basename(filePath).startsWith(".");
 98 |   }
 99 | 
100 |   private isMatchingFile(filePath: string): boolean {
101 |     return this.shouldInclude(filePath) && this.config.pattern.test(filePath);
102 |   }
103 | 
104 |   private async generateFileInfo(filePath: string): Promise<IFileInfo> {
105 |     const stats = await fs.stat(filePath);
106 |     const content = await fs.readFile(filePath, "utf-8");
107 | 
108 |     return {
109 |       name: path.basename(filePath),
110 |       path: filePath,
111 |       content: this.config.compress ? this.compressContent(content) : content,
112 |       ext: path.extname(filePath),
113 |       size: stats.size,
114 |       lines: content.split("\n").filter(line => line.trim() !== "").length
115 |     };
116 |   }
117 | 
118 |   private compressContent(content: string): string {
119 |     return content
120 |       .split("\n")
121 |       .map(line => line.trim())
122 |       .filter(line => line !== "" && !line.startsWith("//"))
123 |       .join("\n");
124 |   }
125 | 
126 |   private generateMarkdown(files: IFileInfo[], treeContent: string): string {
127 |     const header = `# Code Documentation
128 | Generated on: ${new Date().toISOString()}
129 | Total files: ${files.length}
130 | 
131 | ## Project Structure
132 | 
133 | \`\`\`
134 | ${treeContent}
135 | \`\`\`\n`;
136 | 
137 |     const filesSections = files
138 |       .map(file => this.generateFileSection(file))
139 |       .join("\n");
140 |     return header + filesSections;
141 |   }
142 | 
143 |   private generateFileSection(file: IFileInfo): string {
144 |     return `
145 | ## File: ${file.name}
146 | - Path: \`${file.path}\`
147 | - Size: ${this.formatSize(file.size)}
148 | - Extension: ${file.ext}
149 | - Lines of code: ${file.lines}
150 | 
151 | \`\`\`${file.ext.slice(1) || "plaintext"}
152 | ${this.formatContentWithLineNumbers(file.content)}
153 | \`\`\`
154 | 
155 | ---------------------------------------------------------------------------`;
156 |   }
157 | 
158 |   private formatContentWithLineNumbers(content: string): string {
159 |     const lines = content.split("\n");
160 |     const lineNumberWidth = lines.length.toString().length;
161 | 
162 |     return lines
163 |       .map((line, index) => {
164 |         const lineNumber = (index + 1)
165 |           .toString()
166 |           .padStart(lineNumberWidth, " ");
167 |         return `${lineNumber} | ${line}`;
168 |       })
169 |       .join("\n");
170 |   }
171 | 
172 |   private formatSize(bytes: number): string {
173 |     const units = ["B", "KB", "MB", "GB"];
174 |     let size = bytes;
175 |     let unitIndex = 0;
176 | 
177 |     while (size >= 1024 && unitIndex < units.length - 1) {
178 |       size /= 1024;
179 |       unitIndex++;
180 |     }
181 | 
182 |     return `${size.toFixed(2)} ${units[unitIndex]}`;
183 |   }
184 | 
185 |   private renderTree(node: ITreeNode): string {
186 |     const renderNode = (
187 |       node: ITreeNode,
188 |       prefix = "",
189 |       isLast = true
190 |     ): string[] => {
191 |       const lines = [`${prefix}${isLast ? "└── " : "├── "}${node.name}`];
192 |       const childPrefix = prefix + (isLast ? "    " : "│   ");
193 | 
194 |       if (node.type === "directory") {
195 |         node.children.forEach((child, index) => {
196 |           lines.push(
197 |             ...renderNode(
198 |               child,
199 |               childPrefix,
200 |               index === node.children.length - 1
201 |             )
202 |           );
203 |         });
204 |       }
205 | 
206 |       return lines;
207 |     };
208 | 
209 |     return renderNode(node).join("\n");
210 |   }
211 | }
212 | 
```

---------------------------------------------------------------------------

## File: types.ts
- Path: `/root/git/mas/src/services/serviceDocumentation/types.ts`
- Size: 590.00 B
- Extension: .ts
- Lines of code: 31

```ts
 1 | export interface IDocumentationConfig {
 2 |   pattern: RegExp;
 3 |   rootDir: string;
 4 |   outputPath: string;
 5 |   excludePatterns: string[];
 6 |   maxFileSize: number;
 7 |   ignoreHidden: boolean;
 8 |   compress: boolean;
 9 | }
10 | 
11 | export interface ICommandOptionsDoc {
12 |   name: string;
13 |   path: string;
14 |   content: string;
15 |   ext: string;
16 |   size: number;
17 |   lines: number;
18 | }
19 | 
20 | export interface ITreeNode {
21 |   name: string;
22 |   path: string;
23 |   type: "file" | "directory";
24 |   children: ITreeNode[];
25 | }
26 | 
27 | export interface IFileInfo {
28 |   name: string;
29 |   path: string;
30 |   content: string;
31 |   ext: string;
32 |   size: number;
33 |   lines: number;
34 | }
35 | 
```

---------------------------------------------------------------------------