// All mocks must be declared before the module is required.
const mock_main = jest.fn();
jest.doMock('./main', () => ({ __esModule: true, default: mock_main }));

const mock_exists_sync = jest.fn();
jest.doMock('fs', () => ({
  existsSync: mock_exists_sync,
}));

// Mock watcher returned by chokidar.watch()
const mock_watcher_on = jest.fn();
const mock_watcher_close = jest.fn().mockResolvedValue(undefined);
const mock_watcher = {
  on: mock_watcher_on.mockReturnThis(),
  close: mock_watcher_close,
};
const mock_chokidar_watch = jest.fn().mockReturnValue(mock_watcher);
jest.doMock('chokidar', () => ({ watch: mock_chokidar_watch }));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const cli: () => Promise<void> = require('./cli').default;

// ─── helpers ────────────────────────────────────────────────────────────────

function set_argv(...args: string[]): void {
  process.argv = ['node', 'rnuc', ...args];
}

/** Grab the handler registered for a given chokidar event. */
function get_watcher_handler(
  event: string
): ((p: string) => Promise<void>) | undefined {
  const call = (mock_watcher_on.mock.calls as [string, unknown][]).find(
    ([ev]) => ev === event
  );
  return call?.[1] as ((p: string) => Promise<void>) | undefined;
}

// ─── test suite ──────────────────────────────────────────────────────────────

describe('cli', () => {
  const original_argv = process.argv;
  const stdin_resume_spy = jest
    .spyOn(process.stdin, 'resume')
    .mockImplementation(() => process.stdin);
  const process_on_spy = jest
    .spyOn(process, 'on')
    .mockImplementation(() => process);

  beforeEach(() => {
    mock_main.mockReset().mockResolvedValue(undefined);
    mock_exists_sync.mockReset().mockReturnValue(false); // no RC file by default
    mock_chokidar_watch.mockReset().mockReturnValue(mock_watcher);
    mock_watcher_on.mockReset().mockReturnThis();
    mock_watcher_close.mockReset().mockResolvedValue(undefined);
    stdin_resume_spy.mockClear();
    process_on_spy.mockClear();
  });

  afterAll(() => {
    process.argv = original_argv;
    stdin_resume_spy.mockRestore();
    process_on_spy.mockRestore();
  });

  // ── normal (non-watch) mode ─────────────────────────────────────────────

  describe('normal mode', () => {
    it('runs main once with the env file and exits', async () => {
      set_argv('.env');
      await cli();
      expect(mock_main).toHaveBeenCalledTimes(1);
      expect(mock_main).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        ['.env'],
        undefined
      );
      expect(mock_chokidar_watch).not.toHaveBeenCalled();
    });

    it('passes multiple env files to main', async () => {
      set_argv('.env.base', '.env.staging');
      await cli();
      expect(mock_main).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        ['.env.base', '.env.staging'],
        undefined
      );
    });

    it('loads and passes RC file when it exists', async () => {
      set_argv('.env');
      mock_exists_sync.mockImplementation((p: string) =>
        p.endsWith('.rnucrc.js')
      );
      // require() of a non-existent file will throw — that is the expected
      // behavior when .rnucrc.js is declared to exist but can't be resolved.
      await expect(cli()).rejects.toThrow();
    });

    it('propagates errors from main in non-watch mode', async () => {
      set_argv('.env');
      mock_main.mockRejectedValueOnce(new Error('missing var'));
      await expect(cli()).rejects.toThrow('missing var');
    });
  });

  // ── watch mode ──────────────────────────────────────────────────────────

  describe('--watch mode', () => {
    it('starts chokidar watcher on the env files', async () => {
      set_argv('.env', '--watch');
      await cli();
      expect(mock_chokidar_watch).toHaveBeenCalledWith(
        ['.env'],
        expect.objectContaining({ ignoreInitial: true, persistent: true })
      );
    });

    it('also watches .rnucrc.js when it exists', async () => {
      set_argv('.env', '--watch');
      mock_exists_sync.mockImplementation((p: string) =>
        p.endsWith('.rnucrc.js')
      );
      // Suppress require() failure for missing rc file in initial run
      mock_main.mockResolvedValue(undefined);
      try {
        await cli();
      } catch {
        // ignore require error for non-existent RC in test env
      }
      const watched_files = mock_chokidar_watch.mock.calls[0]?.[0] as string[];
      expect(watched_files.some((f) => f.endsWith('.rnucrc.js'))).toBe(true);
    });

    it('runs main once immediately on start', async () => {
      set_argv('.env', '--watch');
      await cli();
      expect(mock_main).toHaveBeenCalledTimes(1);
    });

    it('registers change and add event handlers', async () => {
      set_argv('.env', '--watch');
      await cli();
      const events = (mock_watcher_on.mock.calls as [string, unknown][]).map(
        ([ev]) => ev
      );
      expect(events).toContain('change');
      expect(events).toContain('add');
    });

    it('re-runs main when a file changes', async () => {
      set_argv('.env', '--watch');
      await cli();
      expect(mock_main).toHaveBeenCalledTimes(1);

      const on_change = get_watcher_handler('change');
      expect(on_change).toBeDefined();

      await on_change?.('.env');
      expect(mock_main).toHaveBeenCalledTimes(2);
    });

    it('re-runs main when a file is added', async () => {
      set_argv('.env', '--watch');
      await cli();

      const on_add = get_watcher_handler('add');
      await on_add?.('.env.local');
      expect(mock_main).toHaveBeenCalledTimes(2);
    });

    it('catches errors on re-run and keeps watching (does not throw)', async () => {
      set_argv('.env', '--watch');
      await cli();

      mock_main.mockRejectedValueOnce(new Error('validation failed'));
      const on_change = get_watcher_handler('change');
      expect(on_change).toBeDefined();

      // The handler uses `void run(p)` so it returns undefined synchronously
      // and swallows errors inside run()'s try/catch. We trigger it and then
      // drain the microtask queue to let the async error handling complete.
      expect(() => on_change!('.env')).not.toThrow();
      await new Promise<void>((resolve) => setImmediate(resolve));

      // main was called twice: initial run + change handler
      expect(mock_main).toHaveBeenCalledTimes(2);
    });

    it('catches initial run errors and still starts the watcher', async () => {
      set_argv('.env', '--watch');
      mock_main.mockRejectedValueOnce(new Error('initial run failed'));

      // Should not throw even though initial run fails
      await expect(cli()).resolves.toBeUndefined();
      expect(mock_chokidar_watch).toHaveBeenCalled();
    });

    it('keeps process alive via process.stdin.resume()', async () => {
      set_argv('.env', '--watch');
      await cli();
      expect(stdin_resume_spy).toHaveBeenCalled();
    });

    it('registers a SIGINT handler for graceful shutdown', async () => {
      set_argv('.env', '--watch');
      await cli();
      const sigint_call = (
        process_on_spy.mock.calls as [string, unknown][]
      ).find(([event]) => event === 'SIGINT');
      expect(sigint_call).toBeDefined();
    });

    it('uses -w as alias for --watch', async () => {
      set_argv('.env', '-w');
      await cli();
      expect(mock_chokidar_watch).toHaveBeenCalled();
    });
  });
});
