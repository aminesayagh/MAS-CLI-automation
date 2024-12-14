import { Command } from "commander";
import colors from "colors";

import { IBaseCommand } from "../types/command";

import { DocumentationService } from "../services/serviceDocumentation/DocumentationService";
export interface ICommandOptionsDoc {
  pattern?: string;
  output?: string;
  exclude?: string[];
  compress?: boolean;
  maxSize?: string;
}

export class CommandDoc implements IBaseCommand<ICommandOptionsDoc> {
  public command: Command;

  public constructor() {
    this.command = new Command("doc");
  }

  public configure(): void {
    this.command
      .description("Generate documentation for the current project")
      .option(
        "-p, --pattern <pattern>",
        "File pattern to match (e.g., \\.ts$)",
        "\\.ts$"
      )
      .option("-o, --output <path>", "Output file path", "documentation.md")
      .option("-e, --exclude <patterns...>", "Patterns to exclude", [
        "node_modules",
        "dist"
      ])
      .option(
        "-c, --compress",
        "Compress output by removing empty lines and comments",
        false
      )
      .option(
        "-s, --max-size <size>",
        "Maximum file size to process (e.g., 1MB)",
        "1MB"
      );
  }

  public async execute(options: ICommandOptionsDoc): Promise<void> {
    try {
      console.log(colors.cyan("\nGenerating documentation..."));

      const documentationService = new DocumentationService({
        pattern: new RegExp(options.pattern || "\\.ts$"),
        outputPath: options.output || "documentation.md",
        excludePatterns: options.exclude || ["node_modules", "dist"],
        compress: options.compress || false,
        maxFileSize: CommandDoc.parseMaxSize(options.maxSize || "1MB"),
        rootDir: process.cwd(),
        ignoreHidden: true
      });
      await documentationService.run();

      console.log(colors.green("\nDocumentation generated successfully!"));
      console.log(
        colors.cyan(`Output file: ${options.output || "documentation.md"}\n`)
      );
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
}
