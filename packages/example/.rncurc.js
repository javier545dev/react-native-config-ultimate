/**
 * react-native-config-ultimate configuration file
 * 
 * Options:
 * - on_env: Hook to transform env vars before they're written to native files
 * - js_override: Generate override.js with JS-only vars (default: true)
 * - schema: Validate env vars at build time (type, required, pattern)
 */
module.exports = {
  // Enable JS override file generation (for JS-only vars)
  js_override: true,

  // Transform env vars - add computed values, modify existing ones
  on_env: (env) => {
    return {
      ...env,
      // Add a computed var to prove on_env works
      COMPUTED_VAR: `Hello from on_env! Original HELLO = ${env.HELLO}`,
      // Add current timestamp
      BUILD_TIME: new Date().toISOString(),
    };
  },

  // Schema validation - fails build if vars don't match
  schema: {
    HELLO: { type: 'string', required: true },
    COMPUTED_VAR: { type: 'string', required: true },
    BUILD_TIME: { type: 'string', required: true },
  },
};
