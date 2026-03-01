import yargs from 'yargs';
import * as path from 'path';
import * as fs from 'fs';
import { watch } from 'chokidar';
import main from './main';
import type { RC } from './resolve-env';

/**
 * Load the RC file fresh on every call (clears require cache so
 * changes to .rncurc.js are picked up during --watch mode).
 */
function load_rc(rc_file: string): RC | undefined {
  if (!fs.existsSync(rc_file)) return undefined;
  delete require.cache[require.resolve(rc_file)];
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
  return require(rc_file) as RC;
}

function log(msg: string): void {
  process.stdout.write(`[rncu] ${msg}\n`);
}

function log_err(msg: string): void {
  process.stderr.write(`[rncu] ✗ ${msg}\n`);
}

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
        'Root directory of react-native-config-ultimate ' +
        '(defaults to <projectRoot>/node_modules/react-native-config-ultimate)',
    })
    .option('watch', {
      alias: 'w',
      type: 'boolean',
      default: false,
      description:
        'Watch env file(s) for changes and regenerate automatically. ' +
        'Note: changes to native vars (iOS xcconfig, Android BuildConfig) ' +
        'still require a full native rebuild.',
    })
    .usage('Usage: $0 <env-file> [env-file2 ...] [options]')
    .help()
    .parseAsync();

  const project_root = argv.projectRoot;
  const lib_root =
    argv.libRoot ??
    path.join(
      project_root,
      'node_modules',
      'react-native-config-ultimate'
    );

  // Accept one or more positional env file paths.
  // Multiple files are merged left-to-right (last file wins for conflicting keys).
  const env_files = argv._.map(String);

  const rc_file = path.resolve(project_root, '.rncurc.js');

  // Helper: run the full pipeline once, returning duration in ms.
  // Never throws — errors are caught and logged so watch mode stays alive.
  async function run(changed_path?: string): Promise<void> {
    if (changed_path) {
      log(`${changed_path} changed → regenerating...`);
    }
    const start = Date.now();
    try {
      const rc = load_rc(rc_file);
      await main(project_root, lib_root, env_files, rc);
      if (changed_path) {
        log(`✓ done in ${Date.now() - start}ms`);
      }
    } catch (err) {
      log_err(err instanceof Error ? err.message : String(err));
    }
  }

  // Initial run (always runs, throws on error in non-watch mode).
  if (!argv.watch) {
    const rc = load_rc(rc_file);
    await main(project_root, lib_root, env_files, rc);
    return;
  }

  // --watch mode ────────────────────────────────────────────────────────────
  // Initial run (errors are caught — we still want to start watching).
  await run();

  // Files to watch: env files + RC file (if it exists).
  const files_to_watch = [
    ...env_files,
    ...(fs.existsSync(rc_file) ? [rc_file] : []),
  ];

  const watcher = watch(files_to_watch, {
    ignoreInitial: true,
    persistent: true,
  });

  log(
    `watching: ${files_to_watch.join(', ')}\n` +
      `[rncu] ⚠  native vars (xcconfig/BuildConfig) require a full rebuild to take effect`
  );

  watcher.on('change', (p) => void run(p));
  watcher.on('add', (p) => void run(p));

  // Keep the process alive (chokidar persistent:true already does this,
  // but stdin.resume makes it explicit and survives edge cases).
  process.stdin.resume();

  // Graceful shutdown on Ctrl+C.
  process.on('SIGINT', () => {
    process.stdout.write('\n');
    log('stopping...');
    void watcher.close().then(() => process.exit(0));
  });
}
