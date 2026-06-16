import * as crypto from 'crypto';

export interface SidecarSource {
  path: string;
  sha256: string;
}

export interface Sidecar {
  version: 1;
  rncuVersion: string;
  generatedAt: string;
  combinedHash: string;
  sources: SidecarSource[];
  flavorMapping: Record<string, string> | null;
}

export interface SidecarJson {
  json: string;
  combined_hash: string;
}

export function compute_file_sha256(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

export function build_sidecar(args: {
  rncu_version: string;
  sources: Array<{ path: string; sha256: string }>;
  flavor_mapping: Record<string, string> | null;
}): SidecarJson {
  const { rncu_version, flavor_mapping } = args;

  // Sort sources by path for deterministic output (D-1 spec: lexicographic byte order).
  const sources = [...args.sources].sort((a, b) => a.path.localeCompare(b.path));

  // combinedHash = sha256 of canonical JSON of { version, sources, flavorMapping }
  // Keys sorted lexicographically, no whitespace (D-3).
  const canonical_input = JSON.stringify(
    { flavorMapping: flavor_mapping, sources, version: 1 },
  );
  const combined_hash = compute_file_sha256(canonical_input);

  // Assemble the sidecar in the required deterministic key order (D-1 spec):
  // version, rncuVersion, generatedAt, combinedHash, sources, flavorMapping
  const sidecar: Sidecar = {
    version: 1,
    rncuVersion: rncu_version,
    generatedAt: new Date().toISOString(),
    combinedHash: combined_hash,
    sources,
    flavorMapping: flavor_mapping,
  };

  // Pretty-print with 2-space indent, trailing newline (D-1 spec).
  const json = JSON.stringify(sidecar, null, 2) + '\n';

  return { json, combined_hash };
}
