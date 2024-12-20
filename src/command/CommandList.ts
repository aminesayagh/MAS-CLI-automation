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
