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
