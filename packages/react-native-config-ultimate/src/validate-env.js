"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate_env = validate_env;
const VALID_KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
/**
 * Validate env data against a schema defined in `.rncurc.js`.
 * Called after `on_env` so the hook can add/transform vars before validation.
 *
 * Throws with a human-readable error listing ALL failures at once
 * (not just the first one), so users can fix everything in one pass.
 */
function validate_env(env, schema) {
    const errors = [];
    // Validate all env key names are valid identifiers
    for (const key of Object.keys(env)) {
        if (!VALID_KEY_PATTERN.test(key)) {
            errors.push(`Invalid env key name: "${key}". Keys must start with a letter or underscore and contain only letters, numbers, and underscores.`);
        }
    }
    // Pre-compile all regex patterns once, before iterating over env values.
    // This avoids re-compiling the same pattern for every validated key.
    const compiled_patterns = new Map();
    for (const [key, field] of Object.entries(schema)) {
        if (field.pattern) {
            try {
                compiled_patterns.set(key, new RegExp(field.pattern));
            }
            catch (_a) {
                errors.push(`${key}: invalid regex pattern /${field.pattern}/`);
            }
        }
    }
    for (const [key, field] of Object.entries(schema)) {
        const raw = env[key];
        const missing = raw === undefined || raw === null || String(raw).trim() === '';
        if (field.required && missing) {
            errors.push(`Missing required env var: ${key}`);
            continue; // can't type-check a missing value
        }
        if (missing)
            continue; // optional and not present → OK
        const value = String(raw);
        if (field.type === 'number' && isNaN(Number(value))) {
            errors.push(`${key} must be a number, got "${value}"`);
        }
        if (field.type === 'boolean' && !['true', 'false', '1', '0'].includes(value.toLowerCase())) {
            errors.push(`${key} must be a boolean (true/false/1/0), got "${value}"`);
        }
        const pattern = compiled_patterns.get(key);
        if (pattern && !pattern.test(value)) {
            errors.push(`${key} does not match pattern /${field.pattern}/, got "${value}"`);
        }
    }
    if (errors.length > 0) {
        throw new Error(`\n\n❌ react-native-config-ultimate: env validation failed:\n` +
            errors.map((e) => `  • ${e}`).join('\n') +
            '\n');
    }
}
