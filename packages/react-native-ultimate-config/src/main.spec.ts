const mock_load_env = jest.fn();
jest.doMock('./load-env', () => ({ __esModule: true, default: mock_load_env }));
const mock_render_env = jest.fn();
jest.doMock('./render-env', () => ({ __esModule: true, default: mock_render_env }));
const mock_write_env = jest.fn();
jest.doMock('./write-env', () => ({ __esModule: true, default: mock_write_env }));
const mock_flatten = jest.fn();
jest.doMock('./flatten', () => ({ __esModule: true, default: mock_flatten }));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const main: (...args: unknown[]) => Promise<void> = require('./main').default;

export const files_to_assert = [
  'ios/rnuc.xcconfig',
  'node_modules/react-native-ultimate-config/ios/ConfigValues.h',
  'node_modules/react-native-ultimate-config/android/rnuc.yaml',
  'node_modules/react-native-ultimate-config/index.d.ts',
  'node_modules/react-native-ultimate-config/index.web.js',
  'node_modules/react-native-ultimate-config/override.js',
];

describe('main', () => {
  it('execute render with paths', async () => {
    mock_load_env.mockReturnValueOnce({ data: true });
    mock_flatten.mockReturnValueOnce({ data: true, ios: true });
    mock_flatten.mockReturnValueOnce({ data: true, android: true });
    mock_flatten.mockReturnValueOnce({ data: true, web: true });
    mock_render_env.mockReturnValueOnce({ hello: 'world' });
    await main(
      'project',
      'project/node_modules/react-native-ultimate-config',
      'file'
    );
    expect(mock_load_env).toHaveBeenCalledWith('file');
    expect(mock_flatten).toHaveBeenCalledWith({ data: true }, 'ios');
    expect(mock_flatten).toHaveBeenCalledWith({ data: true }, 'android');
    expect(mock_flatten).toHaveBeenCalledWith({ data: true }, 'web');
    expect(mock_render_env).toHaveBeenCalledWith(
      'project',
      'project/node_modules/react-native-ultimate-config',
      {
        ios: { data: true, ios: true },
        android: { data: true, android: true },
        web: { data: true, web: true },
      },
      undefined
    );
    expect(mock_write_env).toHaveBeenCalledWith({ hello: 'world' });
  });
  describe('rc.on_env', () => {
    it('invoke rc hook with config before flattening', async () => {
      const on_env = jest.fn();
      mock_load_env.mockReturnValueOnce({ data: true });
      await main(
        'project',
        'project/node_modules/react-native-ultimate-config',
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
        'project/node_modules/react-native-ultimate-config',
        'file',
        { on_env }
      );
      expect(on_env).toHaveBeenCalledWith({ data: true, key1: 'bye' });
      expect(mock_flatten).toHaveBeenCalledWith({ data: true, key2: 'hello' }, 'ios');
      expect(mock_flatten).toHaveBeenCalledWith({ data: true, key2: 'hello' }, 'android');
      expect(mock_flatten).toHaveBeenCalledWith({ data: true, key2: 'hello' }, 'web');
    });
  });
});
