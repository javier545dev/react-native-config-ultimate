import load_env from './load-env';
import render_env from './render-env';
import write_env from './write-env';
import flatten from './flatten';
import resolve_env from './resolve-env';
import { validate_env, validate_keys } from './validate-env';
import { build_sidecar } from './sidecar';

import type { RC, EnvData } from './resolve-env';
import type { EnvConfig } from './flatten';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pkg = require('../package.json') as { version: string };

function get_pkg_version(): string {
  return pkg.version;
}

/**
 * Main build-time pipeline:
 *   load → resolve (on_env hook) → validate keys → validate schema → flatten → render → write
 *
 * @param project_root  Root of the React Native project
 * @param lib_root      Root of the react-native-config-ultimate install
 * @param env_file      Path(s) to env file(s). Multiple files are merged (last wins).
 * @param rc            Optional RC config from `.rncurc.js`
 */
export default async function main(
  project_root: string,
  lib_root: string,
  env_file: string | string[],
  rc?: RC
): Promise<void> {
  const { data: raw_env, sources } = load_env(env_file, project_root);
  const env: EnvData = await resolve_env(raw_env, rc);

  // Always validate key names — prevents template injection in generated
  // native files regardless of whether the user has defined a schema.
  validate_keys(env);

  if (rc?.schema) {
    validate_env(env, rc.schema);
  }

  const flat = {
    ios: flatten(env as EnvConfig, 'ios'),
    android: flatten(env as EnvConfig, 'android'),
    web: flatten(env as EnvConfig, 'web'),
  };

  if (rc?.flavor_env_mapping) {
    // Flavor mode: positional env_file args are informational but the mapping drives rendering.
    // Warn if env_file args were also provided (they are ignored in this mode).
    const files = Array.isArray(env_file) ? env_file : [env_file];
    if (files.length > 0 && files[0]) {
      process.stderr.write(
        `[rncu] Warning: rc.flavor_env_mapping is set — positional env file args are ignored in flavor mode.\n`
      );
    }
  }

  const sidecar = build_sidecar({
    rncu_version: get_pkg_version(),
    sources,
    flavor_mapping: rc?.flavor_env_mapping ?? null,
  });

  const files_to_write = render_env(project_root, lib_root, flat, rc, { json: sidecar.json });
  write_env(files_to_write);
}
