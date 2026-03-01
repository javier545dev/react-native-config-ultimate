import yargs from 'yargs';
import * as path from 'path';
import * as fs from 'fs';
import main from './main';

export default async function cli(): Promise<void> {
  (yargs as any).default('projectRoot', process.cwd());
  const project_root = (yargs.argv as any).projectRoot as string;
  (yargs as any).default(
    'libRoot',
    path.join(project_root, 'node_modules', 'react-native-ultimate-config')
  );
  const lib_root = (yargs.argv as any).libRoot as string;
  const env_file = ((yargs.argv as any)._[0] as string);

  const rc_file = path.resolve(project_root, '.rnucrc.js');
  if (fs.existsSync(rc_file)) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const rc = require(rc_file);
    await main(project_root, lib_root, env_file, rc);
  } else {
    await main(project_root, lib_root, env_file);
  }
}
