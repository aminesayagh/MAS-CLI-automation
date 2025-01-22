import { IFileInfo } from "./types";
import { IDocumentationConfig } from "./types";

export class MarkdownService {
  constructor(private readonly config: IDocumentationConfig) {}
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
${this.config.compress ? "" : `Total files: ${totalFiles}`}

## Project Structure

\`\`\`
${treeContent}
\`\`\`\n`;
  }

  private generateFileSection(file: IFileInfo): string {
    const isToCompress = this.config.compress;
    if (isToCompress) {
      return `
Path: ${file.path}
\`\`\`${file.ext.slice(1) || "plaintext"}
${file.content}
\`\`\``;
    }
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
