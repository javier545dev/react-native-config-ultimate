import * as dotenv from 'dotenv';
import { expand } from 'dotenv-expand';
import * as yaml from 'js-yaml';
import * as path from 'path';
import * as fs from 'fs';

import type { EnvData } from './resolve-env';

type FileFormat = 'dotenv' | 'yaml';

function detect_format(config_path: string): FileFormat {
  const { ext } = path.parse(config_path);
  return ext === '.yml' || ext === '.yaml' ? 'yaml' : 'dotenv';
}

function read_yaml(config_path: string): EnvData {
  const data = yaml.load(fs.readFileSync(config_path).toString());
  if (typeof data === 'undefined' || data === null || typeof data !== 'object') {
    throw new Error(`Expected to read object from ${config_path}, but got '${data}'`);
  }
  return data as EnvData;
}

/**
 * Load one or more env files and merge them (last file wins for conflicting keys).
 *
 * Dotenv files (.env, .env.staging, etc.):
 *   - All files are merged first, then variable expansion runs once.
 *   - This means cross-file `$VAR` references work:
 *     .env.base:    BASE_URL=https://api.example.com
 *     .env.staging: API_URL=$BASE_URL/v1  →  https://api.example.com/v1
 *
 * YAML files (.yml, .yaml):
 *   - Each file is loaded and shallow-merged (last wins for top-level keys).
 *   - No variable expansion is applied (use YAML anchors instead).
 *
 * @example
 * // Single file (backward-compatible):
 * load_env('.env')
 *
 * // Multi-file merge:
 * load_env(['.env.base', '.env.staging'])
 */
export default function load_env(config_paths: string | string[]): EnvData {
  const paths = Array.isArray(config_paths) ? config_paths : [config_paths];

  if (paths.length === 0) {
    throw new Error('No env file specified. Usage: rncu <env-file> [env-file2 ...]');
  }

  const formats = paths.map(detect_format);
  const allDotenv = formats.every((f) => f === 'dotenv');

  if (allDotenv) {
    // Merge raw parsed content first, then expand once —
    // so cross-file $VAR references resolve correctly.
    const raw: Record<string, string> = {};
    for (const p of paths) {
      const content = fs.readFileSync(p, 'utf8');
      Object.assign(raw, dotenv.parse(content));
    }
    const result = expand({ parsed: raw });
    return (result.parsed ?? raw) as EnvData;
  }

  // YAML or mixed: load each file individually and shallow-merge.
  const merged: EnvData = {};
  for (let i = 0; i < paths.length; i++) {
    const p = paths[i];
    if (formats[i] === 'yaml') {
      Object.assign(merged, read_yaml(p));
    } else {
      const content = fs.readFileSync(p, 'utf8');
      const parsed = dotenv.parse(content);
      const expanded = expand({ parsed });
      Object.assign(merged, expanded.parsed ?? parsed);
    }
  }
  return merged;
}
