// Mocks must be declared before the module is required.
const mockWriteFileSync = jest.fn();
const mockRenameSync = jest.fn();
const mockUnlinkSync = jest.fn();
const mockCopyFileSync = jest.fn();
const mockMkdirSync = jest.fn(); // needed since write-env creates dest dirs

jest.mock('fs', () => ({
  writeFileSync: (...args: unknown[]) => mockWriteFileSync(...args),
  renameSync: (...args: unknown[]) => mockRenameSync(...args),
  unlinkSync: (...args: unknown[]) => mockUnlinkSync(...args),
  copyFileSync: (...args: unknown[]) => mockCopyFileSync(...args),
  mkdirSync: (...args: unknown[]) => mockMkdirSync(...args),
}));

jest.mock('os', () => ({ tmpdir: () => '/tmp' }));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const write_env: (env: Record<string, string>) => void = require('./write-env').default;

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Returns the temp file path used for a given destination. */
function tmp_for(dest: string): string {
  const rename_call = mockRenameSync.mock.calls.find(
    ([, d]: [string, string]) => d === dest
  );
  return rename_call?.[0] as string;
}

// ─── tests ───────────────────────────────────────────────────────────────────

describe('write-env', () => {
  beforeEach(() => {
    mockWriteFileSync.mockReset();
    mockRenameSync.mockReset();
    mockUnlinkSync.mockReset();
    mockCopyFileSync.mockReset();
    mockMkdirSync.mockReset();
  });

  it('writes content to a temp file then renames to destination (atomic write)', () => {
    write_env({ hello: 'world' });

    // Phase 1: content written to a temp path under /tmp
    expect(mockWriteFileSync).toHaveBeenCalledTimes(1);
    const [tmp_path, content, encoding] = mockWriteFileSync.mock.calls[0] as [string, string, string];
    expect(tmp_path).toMatch(/^\/tmp\/rncu_/);
    expect(content).toBe('world');
    expect(encoding).toBe('utf8');

    // Phase 2: temp renamed to final destination (atomic)
    expect(mockRenameSync).toHaveBeenCalledWith(tmp_path, 'hello');
  });

  it('writes multiple files atomically', () => {
    write_env({ hello: 'world', hey: 'you' });

    expect(mockWriteFileSync).toHaveBeenCalledTimes(2);
    expect(mockRenameSync).toHaveBeenCalledTimes(2);

    // Each dest should have been renamed from a unique temp path
    const tmp_hello = tmp_for('hello');
    const tmp_hey = tmp_for('hey');
    expect(tmp_hello).toBeDefined();
    expect(tmp_hey).toBeDefined();
    expect(tmp_hello).not.toBe(tmp_hey);
  });

  it('falls back to copyFileSync + unlinkSync when renameSync fails (cross-device)', () => {
    // Simulate cross-device rename error (e.g. /tmp on different device)
    mockRenameSync.mockImplementation(() => { throw new Error('EXDEV'); });

    write_env({ hello: 'world' });

    expect(mockCopyFileSync).toHaveBeenCalledWith(expect.stringMatching(/^\/tmp\/rncu_/), 'hello');
    expect(mockUnlinkSync).toHaveBeenCalled();
  });

  it('throws a descriptive error if copyFileSync also fails', () => {
    mockRenameSync.mockImplementation(() => { throw new Error('EXDEV'); });
    mockCopyFileSync.mockImplementation(() => { throw new Error('EACCES: permission denied'); });

    expect(() => write_env({ hello: 'world' })).toThrow(
      /Failed to write output files/
    );
    expect(() => write_env({ hello: 'world' })).toThrow('hello');
  });

  it('cleans up temp files when Phase 1 write fails', () => {
    // First write succeeds, second fails mid-write
    mockWriteFileSync
      .mockImplementationOnce(() => { /* success */ })
      .mockImplementationOnce(() => { throw new Error('ENOSPC: no space left'); });

    expect(() => write_env({ hello: 'world', hey: 'you' })).toThrow(
      /Failed to prepare output files/
    );

    // The first temp file should have been cleaned up
    expect(mockUnlinkSync).toHaveBeenCalledTimes(1);
    // No renames should have happened (no real files touched)
    expect(mockRenameSync).not.toHaveBeenCalled();
  });
});
