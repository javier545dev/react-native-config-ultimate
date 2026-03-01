import load_env from './load-env';
import render_env from './render-env';
import write_env from './write-env';
import flatten from './flatten';
import resolve_env from './resolve-env';

import type { RC, EnvData } from './resolve-env';
import type { EnvConfig } from './flatten';

export default async function main(
  project_root: string,
  lib_root: string,
  env_file: string,
  rc?: RC
): Promise<void> {
  const env: EnvData = await resolve_env(load_env(env_file), rc);
  const flat = {
    ios: flatten(env as EnvConfig, 'ios'),
    android: flatten(env as EnvConfig, 'android'),
    web: flatten(env as EnvConfig, 'web'),
  };
  const files_to_write = render_env(project_root, lib_root, flat, rc);
  write_env(files_to_write);
}
