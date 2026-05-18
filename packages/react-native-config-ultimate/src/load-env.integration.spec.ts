// Integration tests for load-env that run against the REAL `dotenv` and
// `dotenv-expand` libraries (no jest.doMock). The unit spec verifies call
// shape; this spec verifies actual behavior against the installed major
// versions. It is the safety net for future major-version dep bumps.

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import load_env from './load-env';

function make_tmp_dir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'rncu-load-env-'));
}

function write_file(dir: string, name: string, content: string): string {
  const full = path.join(dir, name);
  fs.writeFileSync(full, content, 'utf8');
  return full;
}

describe('load-env (integration with real dotenv / dotenv-expand)', () => {
  let tmp: string;
  const env_snapshot: Record<string, string | undefined> = {};
  const tracked_keys = [
    'RNCU_IT_A',
    'RNCU_IT_B',
    'RNCU_IT_C',
    'RNCU_IT_BASE',
    'RNCU_IT_URL',
    'RNCU_IT_WITH_DEFAULT',
    'RNCU_IT_MISSING',
    'RNCU_IT_PROCESS_LEAK',
  ];

  beforeEach(() => {
    tmp = make_tmp_dir();
    // Save and clear any pre-existing values so the suite is hermetic.
    for (const k of tracked_keys) {
      env_snapshot[k] = process.env[k];
      delete process.env[k];
    }
  });

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
    // Restore — never leak between tests.
    for (const k of tracked_keys) {
      const v = env_snapshot[k];
      if (typeof v === 'undefined') delete process.env[k];
      else process.env[k] = v;
    }
  });

  describe('process.env isolation (regression for watch-mode stale leak)', () => {
    it('does not mutate process.env when loading a single dotenv file', () => {
      const file = write_file(tmp, '.env', 'RNCU_IT_A=from_disk\n');

      const result = load_env(file);

      expect(result).toEqual({ RNCU_IT_A: 'from_disk' });
      // The fix (`processEnv: {}`) means parsed values must NOT leak into
      // process.env. If they do, the next call in a long-running watch
      // process can short-circuit and return the stale value.
      expect(process.env.RNCU_IT_A).toBeUndefined();
    });

    it('returns fresh disk values even when process.env already holds a stale value', () => {
      const file = write_file(tmp, '.env', 'RNCU_IT_PROCESS_LEAK=fresh\n');
      // Simulate the bug condition: a previous run left a stale value in
      // process.env. Without the `processEnv: {}` fix, dotenv-expand would
      // see the existing process.env key and return the stale value.
      process.env.RNCU_IT_PROCESS_LEAK = 'stale';

      const result = load_env(file);

      expect(result).toEqual({ RNCU_IT_PROCESS_LEAK: 'fresh' });
    });

    it('does not mutate process.env in mixed-format mode either', () => {
      const yaml_file = write_file(tmp, 'config.yaml', 'RNCU_IT_A: from_yaml\n');
      const env_file = write_file(tmp, '.env', 'RNCU_IT_B=from_dotenv\n');

      const result = load_env([yaml_file, env_file]);

      expect(result).toEqual({
        RNCU_IT_A: 'from_yaml',
        RNCU_IT_B: 'from_dotenv',
      });
      expect(process.env.RNCU_IT_A).toBeUndefined();
      expect(process.env.RNCU_IT_B).toBeUndefined();
    });
  });

  describe('variable expansion', () => {
    it('expands cross-file $VAR references when merging multiple dotenv files', () => {
      const base = write_file(tmp, '.env.base', 'RNCU_IT_BASE=https://api.example.com\n');
      const stage = write_file(tmp, '.env.staging', 'RNCU_IT_URL=$RNCU_IT_BASE/v1\n');

      const result = load_env([base, stage]);

      expect(result).toEqual({
        RNCU_IT_BASE: 'https://api.example.com',
        RNCU_IT_URL: 'https://api.example.com/v1',
      });
    });

    it('supports ${VAR:-default} syntax (dotenv-expand v13)', () => {
      // When the referenced variable is undefined, the default-value syntax
      // should resolve to the literal after `:-`.
      const file = write_file(
        tmp,
        '.env',
        'RNCU_IT_WITH_DEFAULT=${RNCU_IT_MISSING:-fallback_value}\n'
      );

      const result = load_env(file);

      expect(result.RNCU_IT_WITH_DEFAULT).toBe('fallback_value');
    });

    it('does NOT pull values from process.env into expansions (isolation contract)', () => {
      // With `processEnv: {}`, an undefined .env reference does not silently
      // resolve to a shell/CI variable. This is the documented tradeoff of
      // the watch-mode fix: expansions only see what is on disk.
      process.env.RNCU_IT_BASE = 'http://leaked-from-shell';
      const file = write_file(tmp, '.env', 'RNCU_IT_URL=$RNCU_IT_BASE/v1\n');

      const result = load_env(file);

      // Unresolved → empty string (dotenv-expand strips the unresolved ref).
      expect(result.RNCU_IT_URL).not.toContain('leaked-from-shell');
    });
  });

  describe('merge order', () => {
    it('last file wins for conflicting dotenv keys (real parser)', () => {
      const a = write_file(tmp, '.env.base', 'RNCU_IT_A=base\nRNCU_IT_B=base\n');
      const b = write_file(tmp, '.env.staging', 'RNCU_IT_B=override\nRNCU_IT_C=new\n');

      const result = load_env([a, b]);

      expect(result).toEqual({
        RNCU_IT_A: 'base',
        RNCU_IT_B: 'override',
        RNCU_IT_C: 'new',
      });
    });
  });

  describe('escape sequences (locks current dotenv 17 behavior)', () => {
    // These tests intentionally document the parser's behavior so a future
    // major bump that changes escape handling fails loudly here instead of
    // silently corrupting users' .env values.
    it('treats \\n in DOUBLE-QUOTED values as a real newline', () => {
      const file = write_file(tmp, '.env', 'RNCU_IT_A="line1\\nline2"\n');

      const result = load_env(file);

      expect(result.RNCU_IT_A).toBe('line1\nline2');
    });

    it('treats \\n in UNQUOTED values as a literal backslash+n', () => {
      const file = write_file(tmp, '.env', 'RNCU_IT_A=line1\\nline2\n');

      const result = load_env(file);

      expect(result.RNCU_IT_A).toBe('line1\\nline2');
    });
  });
});
