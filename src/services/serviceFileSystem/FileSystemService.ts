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
