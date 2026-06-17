import * as dotenv from 'dotenv';
import { expand } from 'dotenv-expand';
import * as yaml from 'js-yaml';
import * as path from 'path';
import * as fs from 'fs';

import type { EnvData } from './resolve-env';
import { compute_file_sha256 } from './sidecar';

type FileFormat = 'dotenv' | 'yaml';

export interface EnvSource {
  path: string;
  sha256: string;
}

export interface LoadEnvResult {
  data: EnvData;
  sources: EnvSource[];
}

function detect_format(config_path: string): FileFormat {
  const { ext } = path.parse(config_path);
  return ext === '.yml' || ext === '.yaml' ? 'yaml' : 'dotenv';
}

function parse_yaml(config_path: string, content: string): EnvData {
  const data = yaml.load(content);
  if (typeof data === 'undefined' || data === null || typeof data !== 'object') {
    throw new Error(`Expected to read object from ${config_path}, but got '${data}'`);
  }

  // Reject unsupported YAML types that would silently break template rendering.
  // js-yaml parses unquoted dates (e.g. 2024-01-01) as Date objects.
  const errors: string[] = [];
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (value instanceof Date) {
      errors.push(`${key}: YAML parsed as Date. Quote the value to treat it as a string: "${key}: \\"${String(value)}\\""`);
    } else if (Array.isArray(value)) {
      errors.push(`${key}: arrays are not supported. Use per-platform objects or scalar values.`);
    }
  }
  if (errors.length > 0) {
    throw new Error(
      `[rncu] Unsupported value types in ${config_path}:\n` +
        errors.map((e) => `  • ${e}`).join('\n')
    );
  }

  return data as EnvData;
}

/**
 * Convert an env file path to a POSIX-relative path anchored at project_root.
 * Throws if the resolved path escapes project_root (path traversal guard).
 */
function to_sidecar_path(env_file: string, project_root: string): string {
  const abs = path.resolve(project_root, env_file);
  const rel = path.relative(project_root, abs);
  if (rel.startsWith('..')) {
    throw new Error(
      `[rncu] env file '${env_file}' resolves outside project root '${project_root}'. ` +
        `Only files under the project root are supported.`
    );
  }
  return rel.split(path.sep).join('/');
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
 * Returns `{ data, sources }` where `sources` contains one entry per input file
 * with its POSIX-relative path (from project_root) and SHA-256 hash of raw content.
 *
 * @param config_paths  One or more env file paths.
 * @param project_root  Root of the React Native project (used to anchor sidecar paths).
 *                      Defaults to process.cwd() when not provided.
 *
 * @example
 * // Single file (backward-compatible):
 * load_env('.env', project_root)
 *
 * // Multi-file merge:
 * load_env(['.env.base', '.env.staging'], project_root)
 */
export default function load_env(
  config_paths: string | string[],
  project_root: string = process.cwd()
): LoadEnvResult {
  const paths_arr = Array.isArray(config_paths) ? config_paths : [config_paths];

  if (paths_arr.length === 0) {
    throw new Error('No env file specified. Usage: rncu <env-file> [env-file2 ...]');
  }

  const formats = paths_arr.map(detect_format);
  const allDotenv = formats.every((f) => f === 'dotenv');
  const sources: EnvSource[] = [];

  if (allDotenv) {
    // Merge raw parsed content first, then expand once —
    // so cross-file $VAR references resolve correctly.
    const raw: Record<string, string> = {};
    for (const p of paths_arr) {
      const content = fs.readFileSync(p, 'utf8');
      sources.push({
        path: to_sidecar_path(p, project_root),
        sha256: compute_file_sha256(content),
      });
      Object.assign(raw, dotenv.parse(content));
    }
    const result = expand({ parsed: raw });
    return { data: (result.parsed ?? raw) as EnvData, sources };
  }

  // YAML or mixed: load each file individually and shallow-merge.
  const merged: EnvData = {};
  for (let i = 0; i < paths_arr.length; i++) {
    const p = paths_arr[i] as string;
    if (!p) continue;
    const content = fs.readFileSync(p, 'utf8');
    sources.push({
      path: to_sidecar_path(p, project_root),
      sha256: compute_file_sha256(content),
    });
    if (formats[i] === 'yaml') {
      Object.assign(merged, parse_yaml(p, content));
    } else {
      const parsed = dotenv.parse(content);
      const expanded = expand({ parsed });
      Object.assign(merged, expanded.parsed ?? parsed);
    }
  }
  return { data: merged, sources };
}
