export type EnvData = Record<string, unknown>;

export interface RC {
  on_env?: (env: EnvData) => unknown;
  js_override?: boolean;
}

export default async function resolve_env(env: EnvData, rc?: RC): Promise<EnvData> {
  if (rc && rc.on_env) {
    const patched_env = await rc.on_env(env);
    return typeof patched_env === 'undefined' ? env : (patched_env as EnvData);
  } else {
    return env;
  }
}
