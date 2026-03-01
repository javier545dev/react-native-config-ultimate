import load_env from './load-env';
import render_env from './render-env';
import write_env from './write-env';
import flatten from './flatten';
import resolve_env from './resolve-env';
import { validate_env } from './validate-env';

import type { RC, EnvData } from './resolve-env';
import type { EnvConfig } from './flatten';

/**
 * Main build-time pipeline:
 *   load → resolve (on_env hook) → validate (schema) → flatten → render → write
 *
 * @param project_root  Root of the React Native project
 * @param lib_root      Root of the react-native-ultimate-config install
 * @param env_file      Path(s) to env file(s). Multiple files are merged (last wins).
 * @param rc            Optional RC config from `.rnucrc.js`
 */
export default async function main(
  project_root: string,
  lib_root: string,
  env_file: string | string[],
  rc?: RC
): Promise<void> {
  const env: EnvData = await resolve_env(load_env(env_file), rc);

  if (rc?.schema) {
    validate_env(env, rc.schema);
  }

  const flat = {
    ios: flatten(env as EnvConfig, 'ios'),
    android: flatten(env as EnvConfig, 'android'),
    web: flatten(env as EnvConfig, 'web'),
  };
  const files_to_write = render_env(project_root, lib_root, flat, rc);
  write_env(files_to_write);
}
