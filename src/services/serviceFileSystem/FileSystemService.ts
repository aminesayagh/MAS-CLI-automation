import * as fs from "fs/promises";
import { Stats, statSync } from "fs";
import * as path from "path";

import { FileSizeUnit } from "./types";

interface IFileInfo {
  name: string;
  isDirectory: boolean;
  size: number;
  lastModified: Date;
}

export class FileSystemService {
  private readonly excludeRegexPatterns: RegExp[];

  constructor(
    private readonly maxFileSize: number,
    excludePatterns: string[],
    private readonly ignoreHidden: boolean,
    private readonly pattern: RegExp
  ) {
    this.excludeRegexPatterns = excludePatterns.map(
      pattern => new RegExp(pattern.replace(/\*/g, ".*"))
    );
  }

  async readDirectory(dirPath: string): Promise<string[]> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const filteredEntries = entries.filter(entry => {
      const fullPath = path.join(dirPath, entry.name);

      // Early filtering of hidden files/directories
      if (this.ignoreHidden && this.isHidden(entry.name)) {
        return false;
      }

      // Early filtering of excluded patterns
      if (this.isExcluded(fullPath)) {
        return false;
      }

      // For directories, include if not excluded
      if (entry.isDirectory()) {
        return true;
      }

      // For files, check pattern match
      return this.pattern.test(fullPath);
    });

    return filteredEntries.map(entry => path.join(dirPath, entry.name));
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
    return !this.isExcluded(filePath);
  }

  public isWithinSizeLimit(size: number): boolean {
    return size <= this.maxFileSize;
  }

  public shouldIncludeFile(filePath: string, size: number): boolean {
    return (
      !this.isHidden(filePath) &&
      this.pattern.test(filePath) &&
      size <= this.maxFileSize &&
      !this.isExcluded(filePath)
    );
  }

  public static formatSize(size: number): `${number} ${FileSizeUnit}` {
    const units = ["B", "KB", "MB", "GB"] as FileSizeUnit[];
    let unitIndex = 0;
    let fileSize = size;

    while (fileSize >= 1024 && unitIndex < units.length - 1) {
      fileSize /= 1024;
      unitIndex++;
    }

    return `${fileSize.toFixed(1)} ${units[unitIndex]}` as `${number} ${FileSizeUnit}`;
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

  public static getFileInfo(filePath: string): IFileInfo {
    const stats = statSync(filePath);
    return {
      name: filePath,
      isDirectory: stats.isDirectory(),
      size: stats.size,
      lastModified: stats.mtime
    };
  }

  private isHidden(filePath: string): boolean {
    return path.basename(filePath).startsWith(".");
  }

  private isExcluded(filePath: string): boolean {
    return this.excludeRegexPatterns.some(pattern => pattern.test(filePath));
  }
}
