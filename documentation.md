# Code Documentation
Generated on: 2024-12-16T19:37:13.011Z
Total files: 15

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
        │   │   ├── ServiceContent.ts
        │   │   ├── ServiceDocumentation.ts
        │   │   ├── ServiceMarkdown.ts
        │   │   ├── ServiceTree.ts
        │   │   ├── index.ts
        │   │   └── types.ts
        │   └── serviceFileSystem
        │       ├── FileSystemService.ts
        │       └── index.ts
        └── types
            ├── command.ts
            └── zod.ts
```

## File: index.ts
- Path: `/root/git/mas/src/cli/index.ts`
- Size: 288.00 B
- Extension: .ts
- Lines of code: 11

```ts
#!/usr/bin/env node

import { MasCLI } from "../command/MasCLI";
import colors from "colors";
async function main(): Promise<void> {
  const mas = new MasCLI();
  await mas.run();
}

main().catch(error => {
  console.error(colors.red("An error occurred:"), error);
  process.exit(1);
});

```

---------------------------------------------------------------------------

## File: CommandDoc.ts
- Path: `/root/git/mas/src/command/CommandDoc.ts`
- Size: 3.53 KB
- Extension: .ts
- Lines of code: 105

```ts
import colors from "colors";
import zod from "zod";

import { BaseCommand } from "../types/command";
import { DocumentationService } from "../services/serviceDocumentation/ServiceDocumentation";
import { withFallback } from "../types/zod";

export interface ICommandOptionsDoc {
  pattern: string;
  output: string;
  exclude: string[];
  compress: boolean;
  maxSize: string;
}

export class CommandDoc extends BaseCommand<ICommandOptionsDoc> {
  public static readonly DEFAULT_CONFIG: ICommandOptionsDoc = {
    pattern: "\\.ts$",
    output: "documentation.md",
    exclude: ["node_modules", "dist"],
    compress: false,
    maxSize: "1MB"
  };

  public readonly SCHEMA = zod.object({
    pattern: withFallback(zod.string(), CommandDoc.DEFAULT_CONFIG.pattern),
    output: withFallback(zod.string(), CommandDoc.DEFAULT_CONFIG.output),
    exclude: withFallback(
      zod.array(zod.string()),
      CommandDoc.DEFAULT_CONFIG.exclude
    ),
    compress: withFallback(zod.boolean(), CommandDoc.DEFAULT_CONFIG.compress),
    maxSize: withFallback(zod.string(), CommandDoc.DEFAULT_CONFIG.maxSize)
  });

  public constructor() {
    super("doc");
  }

  public async execute(options: Partial<ICommandOptionsDoc>): Promise<void> {
    try {
      console.log(colors.cyan("\nGenerating documentation..."));

      // Use .strip() to remove invalid fields and use defaults
      const parsedOptions = this.SCHEMA.strip().parse(options);

      const documentationService = new DocumentationService({
        pattern: new RegExp(parsedOptions.pattern),
        outputPath: parsedOptions.output,
        excludePatterns: parsedOptions.exclude,
        compress: parsedOptions.compress,
        maxFileSize: CommandDoc.parseMaxSize(parsedOptions.maxSize),
        rootDir: process.cwd(),
        ignoreHidden: true
      });

      await documentationService.run();

      console.log(colors.green("\nDocumentation generated successfully!"));
      console.log(colors.cyan(`Output file: ${parsedOptions.output}\n`));
    } catch (error: unknown) {
      console.error(
        colors.red("\nError generating documentation:"),
        (error as Error).message
      );
      throw error;
    }
  }

  public static parseMaxSize(size: string): number {
    const units = { B: 1, KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 };
    const match = size.match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)$/i);

    if (!match) {
      throw new Error(
        "Invalid size format. Use format: number + unit (e.g., 1MB)"
      );
    }

    const [, value, unit] = match;
    if (!unit) {
      throw new Error("Unit is required");
    }
    if (!value) {
      throw new Error("Value is required");
    }
    return parseFloat(value) * units[unit.toUpperCase() as keyof typeof units];
  }
  protected configure(): void {
    this.command
      .description("Generate documentation for the current project")
      .option(
        "-p, --pattern <pattern>",
        "File pattern to match (e.g., \\.ts$)",
        CommandDoc.DEFAULT_CONFIG.pattern
      )
      .option(
        "-o, --output <path>",
        "Output file path",
        CommandDoc.DEFAULT_CONFIG.output
      )
      .option(
        "-e, --exclude <patterns...>",
        "Patterns to exclude",
        CommandDoc.DEFAULT_CONFIG.exclude
      )
      .option(
        "-c, --compress",
        "Compress output by removing empty lines and comments",
        CommandDoc.DEFAULT_CONFIG.compress
      )
      .option(
        "-s, --max-size <size>",
        "Maximum file size to process (e.g., 1MB)",
        CommandDoc.DEFAULT_CONFIG.maxSize
      );
  }
}

```

---------------------------------------------------------------------------

## File: CommandExit.ts
- Path: `/root/git/mas/src/command/CommandExit.ts`
- Size: 591.00 B
- Extension: .ts
- Lines of code: 20

```ts
import { BaseCommand } from "../types/command";
import zod from "zod";

export interface ICommandOptionsExit {
  message?: string;
}

export class CommandExit extends BaseCommand<ICommandOptionsExit> {
  public readonly SCHEMA = zod.object({
    message: zod.string().default("Thank you for using MAS CLI. Goodbye!")
  });

  public constructor() {
    super("exit");
  }

  public execute(options: ICommandOptionsExit): void {
    console.log(this.SCHEMA.parse(options).message);
    process.exit(0);
  }

  protected configure(): void {
    this.command.description("Exit the CLI");
  }
}

```

---------------------------------------------------------------------------

## File: CommandList.ts
- Path: `/root/git/mas/src/command/CommandList.ts`
- Size: 2.44 KB
- Extension: .ts
- Lines of code: 77

```ts
import colors from "colors";
import { readdirSync, statSync } from "fs";
import { join } from "path";
import zod from "zod";

import { BaseCommand } from "../types/command";

interface IFileInfo {
  name: string;
  isDirectory: boolean;
  size: number;
  lastModified: Date;
}

export interface ICommandOptionsList {
  all: boolean;
}

export class CommandList extends BaseCommand<ICommandOptionsList> {
  public static readonly DEFAULT_CONFIG: ICommandOptionsList = {
    all: false
  };

  public readonly SCHEMA = zod.object({
    all: zod.boolean().default(CommandList.DEFAULT_CONFIG.all)
  });

  public constructor() {
    super("list");
  }

  public execute(options: Partial<ICommandOptionsList>): void {
    try {
      const currentDir = process.cwd();
      const files = readdirSync(currentDir);

      const fileInfos = files
        .filter(file => options.all || !file.startsWith("."))
        .map(file => CommandList.getFileInfo(join(currentDir, file)))
        .sort((a, b) => {
          if (a.isDirectory !== b.isDirectory) {
            return a.isDirectory ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        });

      console.log(colors.cyan("\nCurrent directory contents:\n"));

      const output = fileInfos.map(file => {
        const name = file.isDirectory
          ? colors.blue(`${file.name}/`)
          : file.name;

        return `${name.padEnd(40)} ${colors.yellow(
          CommandList.formatSize(file.size).padEnd(10)
        )} ${colors.green(file.lastModified.toLocaleDateString())}`;
      });

      console.log(output.join("\n"));
      console.log(colors.cyan(`\nTotal: ${fileInfos.length} items\n`));
    } catch (error) {
      console.error(colors.red("Error listing files:"), error);
    }
  }

  public static formatSize(size: number): string {
    const units = ["B", "KB", "MB", "GB"];
    let unitIndex = 0;
    let fileSize = size;

    while (fileSize >= 1024 && unitIndex < units.length - 1) {
      fileSize /= 1024;
      unitIndex++;
    }

    return `${fileSize.toFixed(1)} ${units[unitIndex]}`;
  }

  public static getFileInfo(filePath: string): IFileInfo {
    const stats = statSync(filePath);
    return {
      name: filePath,
      isDirectory: stats.isDirectory(),
      size: stats.size,
      lastModified: stats.mtime
    };
  }
  protected configure(): void {
    this.command
      .description("List files in the current directory")
      .option("-a, --all", "Show hidden files", false);
  }
}

```

---------------------------------------------------------------------------

## File: MasCLI.ts
- Path: `/root/git/mas/src/command/MasCLI.ts`
- Size: 4.25 KB
- Extension: .ts
- Lines of code: 140

```ts
import { Command } from "commander";
import colors from "colors";
import inquirer from "inquirer";

import { CommandList } from "./CommandList";
import { CommandExit } from "./CommandExit";
import { CommandDoc } from "./CommandDoc";

import { IBaseCommand, CommandRegistry } from "../types/command";
export class MasCLI {
  private program: Command;
  private commandRegistry: CommandRegistry;

  public constructor() {
    this.program = new Command();
    this.commandRegistry = new Map();
    this.initialize();
  }

  public async run(): Promise<void> {
    try {
      if (process.argv.length <= 2) {
        await this.showInteractiveMenu();
      } else {
        this.program.parse(process.argv);

        await this.showInteractiveMenu(false);
      }
    } catch (error) {
      console.error(colors.red("An error occurred:"), error);
      process.exit(1);
    }
  }

  private initialize(): void {
    this.program
      .name("mas")
      .description("CLI automation tools for developers")
      .version("0.0.1");

    // Register all commands
    this.registerCommand<{ all: boolean }>(new CommandList());
    this.registerCommand(new CommandDoc());
    this.registerCommand(new CommandExit());

    // Add help text for when no command is provided
    this.program.on("command:*", () => {
      console.error(
        colors.red(
          "Invalid command: %s\nSee --help for a list of available commands."
        ),
        this.program.args.join(" ")
      );
      this.showInteractiveMenu();
    });
  }

  private registerCommand<T>(command: IBaseCommand<T>): void {
    this.commandRegistry.set(command.command.name(), {
      SCHEMA: command.SCHEMA,
      command: command.command,
      execute: command.execute as (options: unknown) => Promise<void>
    });
    this.program.addCommand(command.command);
  }

  private async showInteractiveMenu(withHello: boolean = true): Promise<void> {
    if (withHello) {
      console.log(
        colors.yellow(
          "\nWelcome to MAS CLI - Your Development Workflow Assistant\n"
        )
      );
    }

    const choices = Array.from(this.commandRegistry.entries()).map(
      ([name, info]) => ({
        name: `${colors.cyan(name.padEnd(15))} ${info.command.description()}`,
        value: name
      })
    );

    const { selectedCommand } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedCommand",
        message: "Please select a command to execute:",
        choices,
        pageSize: 10
      }
    ]);

    const commandInfo = this.commandRegistry.get(selectedCommand);
    if (commandInfo) {
      const { command } = commandInfo;

      try {
        // If command needs additional options, prompt for them
        if (command.options.length > 0) {
          const options = await this.promptCommandOptions(command);
          await commandInfo.execute?.(options);

          await this.showInteractiveMenu(false);
        } else {
          await commandInfo.execute?.({});
        }

        const { shouldContinue } = await inquirer.prompt([
          {
            type: "confirm",
            name: "shouldContinue",
            message: "Do you want to continue?",
            default: true
          }
        ]);

        if (!shouldContinue) {
          console.log(
            colors.yellow("\nThank you for using MAS CLI. Goodbye!\n")
          );
          process.exit(0);
        }
      } catch (error) {
        console.error(
          colors.red("\nAn error occurred while executing the command:"),
          error
        );
        await new Promise(resolve => setTimeout(resolve, 2000)); // Pause to show error
      }
    }
  }

  private async promptCommandOptions(
    command: Command
  ): Promise<ReturnType<typeof inquirer.prompt>> {
    const questions = command.options.map(option => {
      const question: {
        [x: string]: any;
      } = {
        name: option.attributeName(),
        message: option.description
      };

      if (option.mandatory) {
        question["type"] = "input";
        question["validate"] = (input: string) => input.length > 0;
      } else {
        question["type"] = "confirm";
        question["default"] = option.defaultValue;
      }

      return question;
    });

    return inquirer.prompt(
      questions as {
        [x: string]: any;
      }
    );
  }
}

```

---------------------------------------------------------------------------

## File: command.ts
- Path: `/root/git/mas/src/types/command.ts`
- Size: 796.00 B
- Extension: .ts
- Lines of code: 23

```ts
import { Command } from "commander";
import zod from "zod";

export interface IBaseCommand<T> {
  SCHEMA: zod.ZodObject<zod.ZodRawShape>;
  command: Command;
  execute: (options: T) => Promise<void> | void;
}

export abstract class BaseCommand<T> implements IBaseCommand<T> {
  abstract readonly SCHEMA: zod.ZodObject<zod.ZodRawShape>;
  public readonly command: Command;

  public constructor(name: string) {
    this.command = new Command(name);
    this.configure();
  }

  public abstract execute(options: Partial<T>): Promise<void> | void;
  protected abstract configure(): void;
}

export interface ICommandInfo<T> {
  SCHEMA: zod.ZodObject<zod.ZodRawShape>;
  command: Command;
  execute: (options: T) => Promise<void>;
}

export type CommandRegistry = Map<string, ICommandInfo<unknown>>;

```

---------------------------------------------------------------------------

## File: zod.ts
- Path: `/root/git/mas/src/types/zod.ts`
- Size: 400.00 B
- Extension: .ts
- Lines of code: 12

```ts
import zod from "zod";

type Parser<T> = (value: unknown) => T;
const customSchema = <T>(parser: Parser<T>) => zod.unknown().transform(parser);

const withFallback = <T>(schema: zod.ZodType<T>, fallback: NonNullable<T>) =>
  customSchema(val => {
    const parsed = schema.safeParse(val);
    if (parsed.success) {
      return parsed.data;
    }
    return fallback;
  });

export { withFallback };

```

---------------------------------------------------------------------------

## File: ServiceContent.ts
- Path: `/root/git/mas/src/services/serviceDocumentation/ServiceContent.ts`
- Size: 1.37 KB
- Extension: .ts
- Lines of code: 41

```ts
import { IFileInfo } from "./types";
import { FileSystemService } from "../serviceFileSystem";
import * as path from "path";

export class ContentService {
  constructor(
    private readonly fileSystemService: FileSystemService,
    private readonly compress: boolean
  ) {}

  public async generateFileInfo(filePath: string): Promise<IFileInfo> {
    const stats = await this.fileSystemService.getFileStats(filePath);
    const content = await this.fileSystemService.readFileContent(filePath);

    return {
      name: path.basename(filePath),
      path: filePath,
      content: this.compress ? this.compressContent(content) : content,
      ext: path.extname(filePath),
      size: stats.size,
      lines: content.split("\n").filter((line: string) => line.trim() !== "")
        .length
    };
  }

  public formatContentWithLineNumbers(content: string): string {
    const lines = content.split("\n");
    const lineNumberWidth = lines.length.toString().length;

    return lines
      .map((line, index) => {
        const lineNumber = (index + 1)
          .toString()
          .padStart(lineNumberWidth, " ");
        return `${lineNumber} | ${line}`;
      })
      .join("\n");
  }

  private compressContent(content: string): string {
    return content
      .split("\n")
      .map(line => line.trim())
      .filter(line => line !== "" && !line.startsWith("//"))
      .join("\n");
  }
}

```

---------------------------------------------------------------------------

## File: ServiceDocumentation.ts
- Path: `/root/git/mas/src/services/serviceDocumentation/ServiceDocumentation.ts`
- Size: 2.58 KB
- Extension: .ts
- Lines of code: 72

```ts
import { IDocumentationConfig, IFileInfo } from "./types";
import { FileSystemService } from "../serviceFileSystem";
import { TreeService } from "./ServiceTree";
import { ContentService } from "./ServiceContent";
import { MarkdownService } from "./ServiceMarkdown";

export class DocumentationService {
  public static readonly DEFAULT_CONFIG: IDocumentationConfig = {
    pattern: /.*/,
    rootDir: process.cwd(),
    outputPath: "documentation.md",
    excludePatterns: ["node_modules/**", "**/dist/**", "**/*.test.ts"],
    maxFileSize: 1024 * 1024,
    ignoreHidden: true,
    compress: false
  };

  private readonly fileSystemService: FileSystemService;
  private readonly treeService: TreeService;
  private readonly contentService: ContentService;
  private readonly markdownService: MarkdownService;
  private readonly config: IDocumentationConfig;

  public constructor(config: Partial<IDocumentationConfig> = {}) {
    this.config = { ...DocumentationService.DEFAULT_CONFIG, ...config };

    console.log(this.config);
    this.fileSystemService = new FileSystemService(
      this.config.maxFileSize,
      this.config.excludePatterns,
      this.config.ignoreHidden,
      this.config.pattern
    );

    this.treeService = new TreeService(this.fileSystemService);

    this.contentService = new ContentService(
      this.fileSystemService,
      this.config.compress
    );

    this.markdownService = new MarkdownService();
  }

  public async run(): Promise<void> {
    try {
      const files: IFileInfo[] = [];
      const rootNode = await this.treeService.createTreeNode(
        this.config.rootDir,
        ""
      );

      if (!rootNode) {
        throw new Error("Root directory not found");
      }

      const queue = [this.config.rootDir];
      while (queue.length > 0) {
        const currentPath = queue.shift();
        if (!currentPath) continue;

        const stats = await this.fileSystemService.getFileStats(currentPath);

        if (stats.isDirectory()) {
          const entries =
            await this.fileSystemService.readDirectory(currentPath);
          queue.push(...entries);
        } else if (
          this.fileSystemService.shouldIncludeFile(currentPath, stats.size)
        ) {
          files.push(await this.contentService.generateFileInfo(currentPath));
        }
      }

      const treeContent = this.treeService.renderTree(rootNode);
      const markdown = this.markdownService.generateMarkdown(
        files,
        treeContent
      );
      await this.fileSystemService.writeFile(this.config.outputPath, markdown);
    } catch (error) {
      console.error(error);
    }
  }
}

```

---------------------------------------------------------------------------

## File: ServiceMarkdown.ts
- Path: `/root/git/mas/src/services/serviceDocumentation/ServiceMarkdown.ts`
- Size: 1.22 KB
- Extension: .ts
- Lines of code: 41

```ts
import { IFileInfo } from "./types";

export class MarkdownService {
  generateMarkdown(files: IFileInfo[], treeContent: string): string {
    const header = this.generateHeader(files.length, treeContent);
    const filesSections = files
      .map(file => this.generateFileSection(file))
      .join("\n");
    return header + filesSections;
  }

  private generateHeader(totalFiles: number, treeContent: string): string {
    return `# Code Documentation
Generated on: ${new Date().toISOString()}
Total files: ${totalFiles}

## Project Structure

\`\`\`
${treeContent}
\`\`\`\n`;
  }

  private generateFileSection(file: IFileInfo): string {
    return `
## File: ${file.name}
- Path: \`${file.path}\`
- Size: ${this.formatSize(file.size)}
- Extension: ${file.ext}
- Lines of code: ${file.lines}

\`\`\`${file.ext.slice(1) || "plaintext"}
${file.content}
\`\`\`

---------------------------------------------------------------------------`;
  }

  private formatSize(bytes: number): string {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
}

```

---------------------------------------------------------------------------

## File: ServiceTree.ts
- Path: `/root/git/mas/src/services/serviceDocumentation/ServiceTree.ts`
- Size: 2.11 KB
- Extension: .ts
- Lines of code: 69

```ts
import * as path from "path";
import { ITreeNode } from "./types";
import { FileSystemService } from "../serviceFileSystem";

export class TreeService {
  constructor(private readonly fileSystemService: FileSystemService) {}

  async createTreeNode(
    nodePath: string,
    relativePath: string
  ): Promise<ITreeNode | null> {
    const stats = await this.fileSystemService.getFileStats(nodePath);
    const name = path.basename(nodePath);

    if (!this.fileSystemService.shouldInclude(nodePath)) return null;

    if (stats.isDirectory()) {
      const entries = await this.fileSystemService.readDirectory(nodePath);
      const children: ITreeNode[] = [];

      for (const entry of entries) {
        const childNode = await this.createTreeNode(
          entry,
          path.join(relativePath, name)
        );
        if (childNode) children.push(childNode);
      }

      // Only include directory if it has children or contains matching files
      if (children.length > 0) {
        return {
          name,
          path: relativePath || name,
          type: "directory",
          children
        };
      }

      return null;
    }

    // For files, check if they match the pattern
    const stats2 = await this.fileSystemService.getFileStats(nodePath);
    if (this.fileSystemService.shouldIncludeFile(nodePath, stats2.size)) {
      return {
        name,
        path: relativePath || name,
        type: "file",
        children: []
      };
    }

    return null;
  }

  public renderTree(node: ITreeNode): string {
    const renderNode = (
      node: ITreeNode,
      prefix = "",
      isLast = true
    ): string[] => {
      const lines = [`${prefix}${isLast ? "└── " : "├── "}${node.name}`];
      const childPrefix = prefix + (isLast ? "    " : "│   ");

      if (node.type === "directory") {
        node.children.forEach((child, index) => {
          lines.push(
            ...renderNode(
              child,
              childPrefix,
              index === node.children.length - 1
            )
          );
        });
      }

      return lines;
    };

    return renderNode(node).join("\n");
  }
}

```

---------------------------------------------------------------------------

## File: index.ts
- Path: `/root/git/mas/src/services/serviceDocumentation/index.ts`
- Size: 0.00 B
- Extension: .ts
- Lines of code: 0

```ts

```

---------------------------------------------------------------------------

## File: types.ts
- Path: `/root/git/mas/src/services/serviceDocumentation/types.ts`
- Size: 590.00 B
- Extension: .ts
- Lines of code: 31

```ts
export interface IDocumentationConfig {
  pattern: RegExp;
  rootDir: string;
  outputPath: string;
  excludePatterns: string[];
  maxFileSize: number;
  ignoreHidden: boolean;
  compress: boolean;
}

export interface ICommandOptionsDoc {
  name: string;
  path: string;
  content: string;
  ext: string;
  size: number;
  lines: number;
}

export interface ITreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children: ITreeNode[];
}

export interface IFileInfo {
  name: string;
  path: string;
  content: string;
  ext: string;
  size: number;
  lines: number;
}

```

---------------------------------------------------------------------------

## File: FileSystemService.ts
- Path: `/root/git/mas/src/services/serviceFileSystem/FileSystemService.ts`
- Size: 1.55 KB
- Extension: .ts
- Lines of code: 46

```ts
import * as fs from "fs/promises";
import { Stats } from "fs";
import * as path from "path";

export class FileSystemService {
  constructor(
    private readonly maxFileSize: number,
    private readonly excludePatterns: string[],
    private readonly ignoreHidden: boolean,
    private readonly pattern: RegExp
  ) {}

  async readDirectory(dirPath: string): Promise<string[]> {
    const entries = await fs.readdir(dirPath);
    return entries.map(entry => path.join(dirPath, entry));
  }

  async getFileStats(filePath: string): Promise<Stats> {
    return await fs.stat(filePath);
  }

  async readFileContent(filePath: string): Promise<string> {
    return await fs.readFile(filePath, "utf-8");
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    await fs.writeFile(filePath, content, "utf-8");
  }

  public shouldInclude(filePath: string): boolean {
    if (this.ignoreHidden && this.isHidden(filePath)) return false;
    return !this.excludePatterns.some(pattern =>
      new RegExp(pattern.replace(/\*/g, ".*")).test(filePath)
    );
  }

  public isWithinSizeLimit(size: number): boolean {
    return size <= this.maxFileSize;
  }

  public shouldIncludeFile(filePath: string, size: number): boolean {
    return (
      !this.isHidden(filePath) &&
      this.pattern.test(filePath) &&
      size <= this.maxFileSize &&
      !this.excludePatterns.some(pattern =>
        new RegExp(pattern.replace(/\*/g, ".*")).test(filePath)
      )
    );
  }

  private isHidden(filePath: string): boolean {
    return path.basename(filePath).startsWith(".");
  }
}

```

---------------------------------------------------------------------------

## File: index.ts
- Path: `/root/git/mas/src/services/serviceFileSystem/index.ts`
- Size: 57.00 B
- Extension: .ts
- Lines of code: 1

```ts
export { FileSystemService } from "./FileSystemService";

```

---------------------------------------------------------------------------