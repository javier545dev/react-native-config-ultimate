import cp from 'child_process';
import fs from 'fs';
import path from 'path';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { files_to_assert } = require('./main.spec') as { files_to_assert: string[] };

const cli_path = path.join(process.cwd(), 'lib/commonjs/cli.js');

// bin.spec.ts runs the compiled CLI via execFileSync, so the build output
// must exist. CI runs `pnpm build` before `pnpm test`, but a local
// contributor running `pnpm test` in a fresh checkout would otherwise get
// a cryptic ENOENT — fail fast with an actionable message instead.
beforeAll(() => {
  if (!fs.existsSync(cli_path)) {
    throw new Error(
      `Compiled CLI not found at ${cli_path}.\n` +
        `Run \`pnpm build\` (or \`pnpm --filter react-native-config-ultimate build\`) before \`pnpm test\`.`
    );
  }
});

describe('rncu --version', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const expected_version = (require('../package.json') as { version: string }).version;

  it.each(['--version', '-v'])('prints the package version (%s)', (flag) => {
    const stdout = cp.execFileSync('node', [cli_path, flag], { encoding: 'utf8' });
    expect(stdout.trim()).toBe(expected_version);
  });
});

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
      cp.execFileSync('node', [cli_path, env_file_path], {
        cwd: project_root,
      });
      expect(fs.existsSync(path.join(project_root, file_path as string))).toEqual(true);
    });
  }
);
