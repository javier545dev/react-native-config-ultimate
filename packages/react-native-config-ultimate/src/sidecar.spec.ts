import { build_sidecar, compute_file_sha256 } from './sidecar';
import * as crypto from 'crypto';

// ─── T3: canonical JSON shape ─────────────────────────────────────────────────

describe('build_sidecar — JSON shape', () => {
  const base_args = {
    rncu_version: '0.3.0',
    sources: [{ path: '.env.staging', sha256: 'abc123' }],
    flavor_mapping: null,
  };

  it('returns valid JSON', () => {
    const { json } = build_sidecar(base_args);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('top-level key order is version, rncuVersion, generatedAt, combinedHash, sources, flavorMapping', () => {
    const { json } = build_sidecar(base_args);
    const parsed = JSON.parse(json) as Record<string, unknown>;
    const keys = Object.keys(parsed);
    expect(keys).toEqual(['version', 'rncuVersion', 'generatedAt', 'combinedHash', 'sources', 'flavorMapping']);
  });

  it('sources[] are sorted by path lexicographically', () => {
    const { json } = build_sidecar({
      ...base_args,
      sources: [
        { path: '.env.staging', sha256: 'aaa' },
        { path: '.env.dev', sha256: 'bbb' },
        { path: '.env.prod', sha256: 'ccc' },
      ],
    });
    const parsed = JSON.parse(json) as { sources: Array<{ path: string }> };
    const paths = parsed.sources.map((s) => s.path);
    expect(paths).toEqual(['.env.dev', '.env.prod', '.env.staging']);
  });

  it('combinedHash is a 64-char hex string', () => {
    const { json } = build_sidecar(base_args);
    const parsed = JSON.parse(json) as { combinedHash: string };
    expect(parsed.combinedHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('same inputs produce the same combinedHash (deterministic)', () => {
    const r1 = build_sidecar(base_args);
    const r2 = build_sidecar(base_args);
    expect(r1.combined_hash).toBe(r2.combined_hash);
  });

  it('version field equals 1', () => {
    const { json } = build_sidecar(base_args);
    const parsed = JSON.parse(json) as { version: number };
    expect(parsed.version).toBe(1);
  });
});

// ─── T4: combined hash algorithm ─────────────────────────────────────────────

describe('build_sidecar — combined hash algorithm', () => {
  it('flavor_mapping null vs populated produces different combined hashes', () => {
    const sources = [{ path: '.env.staging', sha256: 'abc' }];
    const r_null = build_sidecar({ rncu_version: '0.3.0', sources, flavor_mapping: null });
    const r_flavor = build_sidecar({
      rncu_version: '0.3.0',
      sources,
      flavor_mapping: { staging: '.env.staging' },
    });
    expect(r_null.combined_hash).not.toBe(r_flavor.combined_hash);
  });

  it('changing one source sha256 changes the combined hash', () => {
    const r1 = build_sidecar({
      rncu_version: '0.3.0',
      sources: [{ path: '.env.staging', sha256: 'hash-a' }],
      flavor_mapping: null,
    });
    const r2 = build_sidecar({
      rncu_version: '0.3.0',
      sources: [{ path: '.env.staging', sha256: 'hash-b' }],
      flavor_mapping: null,
    });
    expect(r1.combined_hash).not.toBe(r2.combined_hash);
  });

  it('reordering sources in input still produces the same hash (sorted before hashing)', () => {
    const args_fwd = {
      rncu_version: '0.3.0',
      sources: [
        { path: '.env.staging', sha256: 'sha-s' },
        { path: '.env.dev', sha256: 'sha-d' },
      ],
      flavor_mapping: null,
    };
    const args_rev = {
      ...args_fwd,
      sources: [
        { path: '.env.dev', sha256: 'sha-d' },
        { path: '.env.staging', sha256: 'sha-s' },
      ],
    };
    const r_fwd = build_sidecar(args_fwd);
    const r_rev = build_sidecar(args_rev);
    expect(r_fwd.combined_hash).toBe(r_rev.combined_hash);
  });
});

// ─── T5: compute_file_sha256 ──────────────────────────────────────────────────

describe('compute_file_sha256', () => {
  it('known input "hello" produces the expected SHA-256 hex', () => {
    const expected = crypto.createHash('sha256').update('hello', 'utf8').digest('hex');
    expect(compute_file_sha256('hello')).toBe(expected);
  });

  it('empty string produces the SHA-256 of empty string', () => {
    const expected = crypto.createHash('sha256').update('', 'utf8').digest('hex');
    expect(compute_file_sha256('')).toBe(expected);
  });

  it('returns a 64-character lowercase hex string', () => {
    const result = compute_file_sha256('any content');
    expect(result).toMatch(/^[0-9a-f]{64}$/);
  });
});
