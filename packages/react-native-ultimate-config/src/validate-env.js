"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate_env = validate_env;
/**
 * Validate env data against a schema defined in `.rnucrc.js`.
 * Called after `on_env` so the hook can add/transform vars before validation.
 *
 * Throws with a human-readable error listing ALL failures at once
 * (not just the first one), so users can fix everything in one pass.
 */
function validate_env(env, schema) {
    const errors = [];
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
        if (field.type === 'boolean' &&
            !['true', 'false', '1', '0'].includes(value.toLowerCase())) {
            errors.push(`${key} must be a boolean (true/false/1/0), got "${value}"`);
        }
        if (field.pattern && !new RegExp(field.pattern).test(value)) {
            errors.push(`${key} does not match pattern /${field.pattern}/, got "${value}"`);
        }
    }
    if (errors.length > 0) {
        throw new Error(`\n\n❌ react-native-ultimate-config: env validation failed:\n` +
            errors.map((e) => `  • ${e}`).join('\n') +
            '\n');
    }
}
