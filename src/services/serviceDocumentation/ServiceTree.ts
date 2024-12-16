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
