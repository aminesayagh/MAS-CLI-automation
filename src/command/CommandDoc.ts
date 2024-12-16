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
