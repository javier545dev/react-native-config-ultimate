import yargs from 'yargs';
import * as path from 'path';
import * as fs from 'fs';
import main from './main';
import type { RC } from './resolve-env';

export default async function cli(): Promise<void> {
  const argv = await yargs(process.argv.slice(2))
    .option('projectRoot', {
      type: 'string',
      default: process.cwd(),
      description: 'Root directory of the React Native project',
    })
    .option('libRoot', {
      type: 'string',
      description:
        'Root directory of react-native-ultimate-config ' +
        '(defaults to <projectRoot>/node_modules/react-native-ultimate-config)',
    })
    .usage('Usage: $0 <env-file> [options]')
    .help()
    .parseAsync();

  const project_root = argv.projectRoot;
  const lib_root =
    argv.libRoot ??
    path.join(
      project_root,
      'node_modules',
      'react-native-ultimate-config'
    );
  const env_file = String(argv._[0] ?? '');

  const rc_file = path.resolve(project_root, '.rnucrc.js');
  if (fs.existsSync(rc_file)) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
    const rc = require(rc_file) as RC;
    await main(project_root, lib_root, env_file, rc);
  } else {
    await main(project_root, lib_root, env_file);
  }
}
