import * as fs from "fs/promises";
import * as path from "path";

import { IDocumentationConfig, IFileInfo, ITreeNode } from "./types";

export class DocumentationService {
  private static readonly DEFAULT_CONFIG: IDocumentationConfig = {
    pattern: /.*/,
    rootDir: process.cwd(),
    outputPath: "documentation.md",
    excludePatterns: ["node_modules/**", "**/dist/**", "**/*.test.ts"],
    maxFileSize: 1024 * 1024,
    ignoreHidden: true,
    compress: false
  };

  private config: IDocumentationConfig;

  public constructor(config: Partial<IDocumentationConfig> = {}) {
    this.config = { ...DocumentationService.DEFAULT_CONFIG, ...config };
  }

  public async run(): Promise<void> {
    try {
      const files: IFileInfo[] = [];
      const rootNode = await this.createTreeNode(this.config.rootDir);

      if (!rootNode) {
        throw new Error("Root directory not found");
      }

      const queue = [this.config.rootDir];
      while (queue.length > 0) {
        const currentPath = queue.shift();
        if (!currentPath) continue;
        const stats = await fs.stat(currentPath);

        if (stats.isDirectory()) {
          const entries = await fs.readdir(currentPath);
          queue.push(...entries.map(entry => path.join(currentPath, entry)));
        } else if (
          this.isMatchingFile(currentPath) &&
          stats.size <= this.config.maxFileSize
        ) {
          files.push(await this.generateFileInfo(currentPath));
        }
      }

      const treeContent = this.renderTree(rootNode);
      const markdown = this.generateMarkdown(files, treeContent);
      await fs.writeFile(this.config.outputPath, markdown, "utf-8");
    } catch (error) {
      console.error(error);
    }
  }

  private async createTreeNode(
    nodePath: string,
    relativePath = ""
  ): Promise<ITreeNode | null> {
    const stats = await fs.stat(nodePath);
    const name = path.basename(nodePath);

    if (!this.shouldInclude(nodePath)) return null;

    if (stats.isDirectory()) {
      const entries = await fs.readdir(nodePath, { withFileTypes: true });
      const children: ITreeNode[] = [];

      for (const entry of entries) {
        const childNode = await this.createTreeNode(
          path.join(nodePath, entry.name),
          path.join(relativePath, name)
        );
        if (childNode) children.push(childNode);
      }

      return { name, path: relativePath || name, type: "directory", children };
    }

    if (this.isMatchingFile(nodePath)) {
      return { name, path: relativePath || name, type: "file", children: [] };
    }

    return null;
  }

  private shouldInclude(filePath: string): boolean {
    if (this.config.ignoreHidden && this.isHidden(filePath)) return false;

    return !this.config.excludePatterns.some(pattern =>
      new RegExp(pattern.replace(/\*/g, ".*")).test(filePath)
    );
  }

  private isHidden(filePath: string): boolean {
    return path.basename(filePath).startsWith(".");
  }

  private isMatchingFile(filePath: string): boolean {
    return this.shouldInclude(filePath) && this.config.pattern.test(filePath);
  }

  private async generateFileInfo(filePath: string): Promise<IFileInfo> {
    const stats = await fs.stat(filePath);
    const content = await fs.readFile(filePath, "utf-8");

    return {
      name: path.basename(filePath),
      path: filePath,
      content: this.config.compress ? this.compressContent(content) : content,
      ext: path.extname(filePath),
      size: stats.size,
      lines: content.split("\n").filter(line => line.trim() !== "").length
    };
  }

  private compressContent(content: string): string {
    return content
      .split("\n")
      .map(line => line.trim())
      .filter(line => line !== "" && !line.startsWith("//"))
      .join("\n");
  }

  private generateMarkdown(files: IFileInfo[], treeContent: string): string {
    const header = `# Code Documentation
Generated on: ${new Date().toISOString()}
Total files: ${files.length}

## Project Structure

\`\`\`
${treeContent}
\`\`\`\n`;

    const filesSections = files
      .map(file => this.generateFileSection(file))
      .join("\n");
    return header + filesSections;
  }

  private generateFileSection(file: IFileInfo): string {
    return `
## File: ${file.name}
- Path: \`${file.path}\`
- Size: ${this.formatSize(file.size)}
- Extension: ${file.ext}
- Lines of code: ${file.lines}

\`\`\`${file.ext.slice(1) || "plaintext"}
${this.formatContentWithLineNumbers(file.content)}
\`\`\`

---------------------------------------------------------------------------`;
  }

  private formatContentWithLineNumbers(content: string): string {
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

  private renderTree(node: ITreeNode): string {
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
