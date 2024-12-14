export interface IDocumentationConfig {
  pattern: RegExp;
  rootDir: string;
  outputPath: string;
  excludePatterns: string[];
  maxFileSize: number;
  ignoreHidden: boolean;
  compress: boolean;
}

export interface ICommandOptionsDoc {
  name: string;
  path: string;
  content: string;
  ext: string;
  size: number;
  lines: number;
}

export interface ITreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children: ITreeNode[];
}

export interface IFileInfo {
  name: string;
  path: string;
  content: string;
  ext: string;
  size: number;
  lines: number;
}
