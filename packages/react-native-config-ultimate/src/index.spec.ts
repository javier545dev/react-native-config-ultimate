// Test the runtime entry point (index.ts).
// Each test isolates module state by using jest.isolateModules + require().

const MOCK_OVERRIDE = { OVERRIDE_KEY: 'from-override' };

// Default mock for override.js — always available
jest.mock('../override', () => MOCK_OVERRIDE, { virtual: true });

describe('index.ts — runtime config', () => {
  function loadIndex(setup: {
    turboModule?: { getAll: () => string } | null;
    nativeModule?: Record<string, unknown> | undefined;
  }) {
    let result: Record<string, unknown>;

    jest.isolateModules(() => {
      // Mock react-native before requiring index
      jest.doMock('react-native', () => ({
        TurboModuleRegistry: {
          get: jest.fn().mockReturnValue(setup.turboModule ?? null),
        },
        NativeModules: {
          UltimateConfig: setup.nativeModule,
        },
        Platform: { select: jest.fn((opts: Record<string, unknown>) => opts.ios) },
      }));

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      result = require('./index').default;
    });

    return result!;
  }

  // ─── New Architecture (TurboModules) ─────────────────────────────────

  describe('New Architecture (TurboModule with getAll)', () => {
    it('parses JSON from getAll() and merges with override', () => {
      const config = loadIndex({
        turboModule: {
          getAll: () => JSON.stringify({ API_URL: 'https://api.com', PORT: 3000 }),
        },
      });

      expect(config.API_URL).toBe('https://api.com');
      expect(config.PORT).toBe(3000);
      // override wins
      expect(config.OVERRIDE_KEY).toBe('from-override');
    });

    it('falls back to empty config when getAll() returns invalid JSON', () => {
      const config = loadIndex({
        turboModule: {
          getAll: () => 'not-valid-json{{{',
        },
      });

      // nativeConstants = {} due to parse error, only override present
      expect(config.OVERRIDE_KEY).toBe('from-override');
      expect(Object.keys(config).filter((k) => k !== 'OVERRIDE_KEY')).toHaveLength(0);
    });

    it('falls back to empty config when getAll() throws', () => {
      const config = loadIndex({
        turboModule: {
          getAll: () => {
            throw new Error('native crash');
          },
        },
      });

      expect(config.OVERRIDE_KEY).toBe('from-override');
    });
  });

  // ─── Old Architecture (Bridge) ──────────────────────────────────────

  describe('Old Architecture (NativeModules bridge)', () => {
    it('reads constants from NativeModules.UltimateConfig', () => {
      const config = loadIndex({
        turboModule: null,
        nativeModule: { DB_NAME: 'mydb', DEBUG: true },
      });

      expect(config.DB_NAME).toBe('mydb');
      expect(config.DEBUG).toBe(true);
      expect(config.OVERRIDE_KEY).toBe('from-override');
    });

    it('returns empty config when NativeModules.UltimateConfig is undefined', () => {
      const config = loadIndex({
        turboModule: null,
        nativeModule: undefined,
      });

      // Only override keys
      expect(config.OVERRIDE_KEY).toBe('from-override');
    });
  });

  // ─── Override precedence ────────────────────────────────────────────

  describe('override precedence', () => {
    it('override values win over native constants', () => {
      const config = loadIndex({
        turboModule: {
          getAll: () => JSON.stringify({ OVERRIDE_KEY: 'from-native' }),
        },
      });

      // override.js spread comes AFTER nativeConstants, so it wins
      expect(config.OVERRIDE_KEY).toBe('from-override');
    });
  });

  // ─── Edge: turboModule exists but getAll is not a function ──────────

  describe('turboModule without getAll function', () => {
    it('falls back to Old Arch path when getAll is missing', () => {
      const config = loadIndex({
        turboModule: {} as { getAll: () => string },
        nativeModule: { FALLBACK: 'old-arch' },
      });

      expect(config.FALLBACK).toBe('old-arch');
      expect(config.OVERRIDE_KEY).toBe('from-override');
    });
  });
});
