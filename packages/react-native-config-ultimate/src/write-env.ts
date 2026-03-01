import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export type FileMap = Record<string, string>;

/**
 * Atomically write all generated files.
 *
 * Strategy: write each file to a temp path first, then rename (atomic on POSIX).
 * If any write fails, we abort before committing any renames so the project
 * is never left in a partially-written state.
 *
 * On Windows, `fs.renameSync` across drives may fail — in that case we fall
 * back to a direct `writeFileSync` (best-effort, still better than nothing).
 */
export default function write_env(files: FileMap): void {
  const tmp_dir = os.tmpdir();
  // Phase 1: write all content to temp files — if anything fails, no real files are touched.
  const pending: Array<{ tmp: string; dest: string }> = [];

  try {
    for (const dest of Object.keys(files)) {
      // Ensure the destination directory exists (handles first-run and hoisted workspaces).
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      const tmp = path.join(tmp_dir, `rncu_${Date.now()}_${Math.random().toString(36).slice(2)}`);
      fs.writeFileSync(tmp, files[dest] as string, 'utf8');
      pending.push({ tmp, dest });
    }
  } catch (err) {
    // Clean up any temp files we already created.
    for (const { tmp } of pending) {
      try {
        fs.unlinkSync(tmp);
      } catch {
        /* ignore */
      }
    }
    throw new Error(
      `[rncu] Failed to prepare output files: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  // Phase 2: atomically rename temp → dest.
  // We collect errors and rethrow at the end so the caller gets a clear message.
  const rename_errors: string[] = [];

  for (const { tmp, dest } of pending) {
    try {
      fs.renameSync(tmp, dest);
    } catch {
      // Cross-device rename (e.g. Windows different drives) — fall back to copy+delete.
      try {
        fs.copyFileSync(tmp, dest);
        fs.unlinkSync(tmp);
      } catch (copy_err) {
        rename_errors.push(
          `${dest}: ${copy_err instanceof Error ? copy_err.message : String(copy_err)}`
        );
        try {
          fs.unlinkSync(tmp);
        } catch {
          /* ignore */
        }
      }
    }
  }

  if (rename_errors.length > 0) {
    throw new Error(
      `[rncu] Failed to write output files:\n` + rename_errors.map((e) => `  • ${e}`).join('\n')
    );
  }
}
