import cp from 'child_process';
import fs from 'fs';
import path from 'path';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { files_to_assert } = require('./main.spec') as { files_to_assert: string[] };

describe.each`
  extension  | env_test_content
  ${''}      | ${'hello=world'}
  ${'.yaml'} | ${'hello: world'}
  ${'.yml'}  | ${'hello: world'}
`(
  'test codegen',
  ({ extension, env_test_content }: { extension: string; env_test_content: string }) => {
    let project_root: string;
    beforeAll(() => {
      project_root = path.join(process.cwd(), fs.mkdtempSync('rncu-jest'));
      for (const file_path of files_to_assert) {
        const { dir } = path.parse(file_path);
        const folder = path.join(project_root, dir);
        fs.mkdirSync(folder, { recursive: true });
      }
    });
    afterAll(() => {
      fs.rmSync(project_root, { recursive: true, force: true });
    });
    it.each(files_to_assert.map((k) => [k]))('creates file at path %s', (file_path) => {
      const env_file_path = path.join(project_root, `.env${extension}`);
      fs.writeFileSync(env_file_path, env_test_content);
      cp.execFileSync('node', [path.join(process.cwd(), 'lib/commonjs/cli.js'), env_file_path], {
        cwd: project_root,
      });
      expect(fs.existsSync(path.join(project_root, file_path as string))).toEqual(true);
    });
  }
);
