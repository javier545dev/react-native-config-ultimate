const mock_load_env = jest.fn();
jest.doMock('./load-env', () => ({ __esModule: true, default: mock_load_env }));
const mock_render_env = jest.fn();
jest.doMock('./render-env', () => ({ __esModule: true, default: mock_render_env }));
const mock_write_env = jest.fn();
jest.doMock('./write-env', () => ({ __esModule: true, default: mock_write_env }));
const mock_flatten = jest.fn();
jest.doMock('./flatten', () => ({ __esModule: true, default: mock_flatten }));
const mock_validate_env = jest.fn();
jest.doMock('./validate-env', () => ({ validate_env: mock_validate_env }));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const main: (...args: unknown[]) => Promise<void> = require('./main').default;


export const files_to_assert = [
  'ios/rncu.xcconfig',
  'node_modules/react-native-config-ultimate/ios/ConfigValues.h',
  'node_modules/react-native-config-ultimate/android/rncu.yaml',
  'node_modules/react-native-config-ultimate/index.d.ts',
  'node_modules/react-native-config-ultimate/index.web.js',
  'node_modules/react-native-config-ultimate/override.js',
];

describe('main', () => {
  beforeEach(() => {
    mock_load_env.mockReset();
    mock_render_env.mockReset();
    mock_write_env.mockReset();
    mock_flatten.mockReset();
    mock_validate_env.mockReset();
  });

  it('execute render with paths (string arg — backward-compatible)', async () => {
    mock_load_env.mockReturnValueOnce({ data: true });
    mock_flatten.mockReturnValueOnce({ data: true, ios: true });
    mock_flatten.mockReturnValueOnce({ data: true, android: true });
    mock_flatten.mockReturnValueOnce({ data: true, web: true });
    mock_render_env.mockReturnValueOnce({ hello: 'world' });
    await main(
      'project',
      'project/node_modules/react-native-config-ultimate',
      'file'
    );
    expect(mock_load_env).toHaveBeenCalledWith('file');
    expect(mock_flatten).toHaveBeenCalledWith({ data: true }, 'ios');
    expect(mock_flatten).toHaveBeenCalledWith({ data: true }, 'android');
    expect(mock_flatten).toHaveBeenCalledWith({ data: true }, 'web');
    expect(mock_render_env).toHaveBeenCalledWith(
      'project',
      'project/node_modules/react-native-config-ultimate',
      {
        ios: { data: true, ios: true },
        android: { data: true, android: true },
        web: { data: true, web: true },
      },
      undefined
    );
    expect(mock_write_env).toHaveBeenCalledWith({ hello: 'world' });
  });

  it('passes array of env files to load_env (multi-file merge)', async () => {
    mock_load_env.mockReturnValueOnce({ data: true });
    mock_flatten.mockReturnValue({});
    mock_render_env.mockReturnValueOnce({});
    await main(
      'project',
      'project/node_modules/react-native-config-ultimate',
      ['.env.base', '.env.staging']
    );
    expect(mock_load_env).toHaveBeenCalledWith(['.env.base', '.env.staging']);
  });
  describe('rc.on_env', () => {
    it('invoke rc hook with config before flattening', async () => {
      const on_env = jest.fn();
      mock_load_env.mockReturnValueOnce({ data: true });
      await main(
        'project',
        'project/node_modules/react-native-config-ultimate',
        'file',
        { on_env }
      );
      expect(on_env).toHaveBeenCalledWith({ data: true });
      expect(mock_flatten).toHaveBeenCalledWith({ data: true }, 'ios');
      expect(mock_flatten).toHaveBeenCalledWith({ data: true }, 'android');
      expect(mock_flatten).toHaveBeenCalledWith({ data: true }, 'web');
    });
    it('hook can add or remove values', async () => {
      const on_env = jest.fn();
      on_env.mockImplementation((env: Record<string, unknown>) => {
        const { key1, ...rest } = env;
        void key1;
        return { ...rest, key2: 'hello' };
      });
      mock_load_env.mockReturnValueOnce({ data: true, key1: 'bye' });
      await main(
        'project',
        'project/node_modules/react-native-config-ultimate',
        'file',
        { on_env }
      );
      expect(on_env).toHaveBeenCalledWith({ data: true, key1: 'bye' });
      expect(mock_flatten).toHaveBeenCalledWith({ data: true, key2: 'hello' }, 'ios');
      expect(mock_flatten).toHaveBeenCalledWith({ data: true, key2: 'hello' }, 'android');
      expect(mock_flatten).toHaveBeenCalledWith({ data: true, key2: 'hello' }, 'web');
    });
  });

  describe('rc.schema', () => {
    it('calls validate_env when schema is provided', async () => {
      const schema = { API_KEY: { type: 'string' as const, required: true } };
      mock_load_env.mockReturnValueOnce({ API_KEY: 'secret' });
      mock_flatten.mockReturnValue({});
      mock_render_env.mockReturnValueOnce({});
      await main(
        'project',
        'project/node_modules/react-native-config-ultimate',
        'file',
        { schema }
      );
      expect(mock_validate_env).toHaveBeenCalledWith({ API_KEY: 'secret' }, schema);
    });

    it('does not call validate_env when no schema is provided', async () => {
      mock_load_env.mockReturnValueOnce({ data: true });
      mock_flatten.mockReturnValue({});
      mock_render_env.mockReturnValueOnce({});
      await main(
        'project',
        'project/node_modules/react-native-config-ultimate',
        'file'
      );
      expect(mock_validate_env).not.toHaveBeenCalled();
    });

    it('validates env AFTER on_env hook runs (hook output is validated)', async () => {
      const schema = { INJECTED_KEY: { type: 'string' as const, required: true } };
      const on_env = jest.fn().mockReturnValue({ INJECTED_KEY: 'from-hook' });
      mock_load_env.mockReturnValueOnce({});
      mock_flatten.mockReturnValue({});
      mock_render_env.mockReturnValueOnce({});
      await main(
        'project',
        'project/node_modules/react-native-config-ultimate',
        'file',
        { on_env, schema }
      );
      // validate_env receives the HOOK output, not the raw env
      expect(mock_validate_env).toHaveBeenCalledWith(
        { INJECTED_KEY: 'from-hook' },
        schema
      );
    });

    it('propagates validation error thrown by validate_env', async () => {
      const schema = { API_KEY: { type: 'string' as const, required: true } };
      mock_load_env.mockReturnValueOnce({});
      mock_validate_env.mockImplementation(() => {
        throw new Error('❌ validation failed: Missing required env var: API_KEY');
      });
      await expect(
        main(
          'project',
          'project/node_modules/react-native-config-ultimate',
          'file',
          { schema }
        )
      ).rejects.toThrow('Missing required env var: API_KEY');
    });
  });
});
