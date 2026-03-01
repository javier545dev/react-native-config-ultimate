import * as fs from 'fs';

export type FileMap = Record<string, string>;

export default function write_env(files: FileMap): void {
  for (const filePath in files) {
    fs.writeFileSync(filePath, files[filePath]);
  }
}
