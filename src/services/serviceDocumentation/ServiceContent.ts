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
