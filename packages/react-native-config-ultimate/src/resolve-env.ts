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
  /**
   * Hook to transform env data before validation and rendering.
   * Return the modified env object, or `undefined`/`void` to keep the original.
   *
   * **Important:** if you mutate `env` in place without returning it, the
   * mutations are ignored. Always return the modified object.
   */
  on_env?: (env: EnvData) => EnvData | undefined | void | Promise<EnvData | undefined | void>;
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
    if (typeof patched_env === 'undefined') return env;
    if (!patched_env || typeof patched_env !== 'object' || Array.isArray(patched_env)) {
      throw new Error(
        `[rncu] on_env hook must return an object (or undefined to keep the original), ` +
          `but got ${typeof patched_env}: ${String(patched_env)}`
      );
    }
    return patched_env as EnvData;
  } else {
    return env;
  }
}
