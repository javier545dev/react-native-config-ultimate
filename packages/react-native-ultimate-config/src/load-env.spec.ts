const mockReadFileSync = jest.fn();
jest.doMock('fs', () => ({ readFileSync: mockReadFileSync }));
const mockConfig = jest.fn();
jest.doMock('dotenv', () => ({ config: mockConfig }));
const mockYaml = jest.fn();
jest.doMock('js-yaml', () => ({ load: mockYaml }));
// eslint-disable-next-line @typescript-eslint/no-require-imports
const load_env: (path: string) => Record<string, unknown> = require('./load-env').default;

describe('load-env', () => {
  beforeEach(() => {
    mockConfig.mockReset();
    mockYaml.mockReset();
    mockReadFileSync.mockReset();
  });
  it('reads dotenv by default', () => {
    mockConfig.mockReturnValueOnce({ parsed: { hello: 'world' } });
    const result = load_env('hello');
    expect(mockConfig).toHaveBeenCalledWith({ path: 'hello' });
    expect(result).toEqual({ hello: 'world' });
  });
  it.each`
    extension
    ${'yml'}
    ${'yaml'}
  `("reads yaml when extension is '$extension'", ({ extension }: { extension: string }) => {
    mockReadFileSync.mockReturnValueOnce(Buffer.from('data'));
    mockYaml.mockReturnValueOnce({ hello: 'world' });
    const result = load_env(`hello.${extension}`);
    expect(mockReadFileSync).toHaveBeenCalledWith(`hello.${extension}`);
    expect(mockYaml).toHaveBeenCalledWith('data');
    expect(result).toEqual({ hello: 'world' });
  });
  describe.each`
    extension
    ${'yml'}
    ${'yaml'}
  `(
    "throw when yaml is not an object with extension '$extension'",
    ({ extension }: { extension: string }) => {
      it.each`
        content
        ${'abc:def'}
        ${false}
        ${true}
        ${42}
        ${null}
        ${undefined}
      `("when content is '$content'", ({ content }: { content: unknown }) => {
        mockReadFileSync.mockReturnValueOnce(Buffer.from('data'));
        mockYaml.mockReturnValueOnce(content);
        expect(() => {
          load_env(`hello.${extension}`);
        }).toThrow();
      });
    }
  );
});
