export type EnvData = Record<string, unknown>;

/**
 * Schema definition for a single environment variable.
 * Used in `.rncurc.js` to validate env vars at build time.
 *
 * @example
 * module.exports = {
 *   schema: {
 *     API_URL:    { type: 'string',  required: true },
 *     TIMEOUT_MS: { type: 'number',  required: true },
 *     DEBUG:      { type: 'boolean', required: false },
 *     ENV_NAME:   { type: 'string',  required: true, pattern: '^(dev|staging|prod)$' },
 *   }
 * };
 */
export interface SchemaField {
  /** Expected type. Strings are always accepted as-is; number/boolean validate parsability. */
  type: 'string' | 'number' | 'boolean';
  /** If true, build fails when this var is missing or empty. Default: false. */
  required?: boolean;
  /** Optional regex pattern the value must match (applied to string representation). */
  pattern?: string;
}

export type Schema = Record<string, SchemaField>;

export interface RC {
  on_env?: (env: EnvData) => unknown;
  js_override?: boolean;
  /**
   * Optional schema for build-time validation of env vars.
   * Validated after `on_env` runs (so the hook can add/transform vars before validation).
   */
  schema?: Schema;
}

export default async function resolve_env(env: EnvData, rc?: RC): Promise<EnvData> {
  if (rc && rc.on_env) {
    const patched_env = await rc.on_env(env);
    return typeof patched_env === 'undefined' ? env : (patched_env as EnvData);
  } else {
    return env;
  }
}
