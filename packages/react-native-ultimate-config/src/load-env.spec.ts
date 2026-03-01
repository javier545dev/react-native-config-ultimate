const mockReadFileSync = jest.fn();
jest.doMock('fs', () => ({ readFileSync: mockReadFileSync }));

const mockParse = jest.fn();
jest.doMock('dotenv', () => ({ parse: mockParse }));

const mockExpand = jest.fn();
jest.doMock('dotenv-expand', () => ({ expand: mockExpand }));

const mockYaml = jest.fn();
jest.doMock('js-yaml', () => ({ load: mockYaml }));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const load_env: (paths: string | string[]) => Record<string, unknown> =
  require('./load-env').default;

describe('load-env', () => {
  beforeEach(() => {
    mockReadFileSync.mockReset();
    mockParse.mockReset();
    mockExpand.mockReset();
    mockYaml.mockReset();
    // Default expand: return parsed as-is (no expansion side effects)
    mockExpand.mockImplementation(
      (input: { parsed: Record<string, string> }) => input
    );
  });

  describe('dotenv format', () => {
    it('reads a single dotenv file (backward-compatible string arg)', () => {
      mockReadFileSync.mockReturnValueOnce('hello=world');
      mockParse.mockReturnValueOnce({ hello: 'world' });
      const result = load_env('hello');
      expect(mockReadFileSync).toHaveBeenCalledWith('hello', 'utf8');
      expect(mockParse).toHaveBeenCalledWith('hello=world');
      expect(result).toEqual({ hello: 'world' });
    });

    it('reads a single dotenv file when passed as an array', () => {
      mockReadFileSync.mockReturnValueOnce('hello=world');
      mockParse.mockReturnValueOnce({ hello: 'world' });
      const result = load_env(['hello']);
      expect(mockReadFileSync).toHaveBeenCalledWith('hello', 'utf8');
      expect(result).toEqual({ hello: 'world' });
    });

    it('merges multiple dotenv files, last file wins for conflicts', () => {
      mockReadFileSync
        .mockReturnValueOnce('A=base\nB=base')
        .mockReturnValueOnce('B=override\nC=new');
      mockParse
        .mockReturnValueOnce({ A: 'base', B: 'base' })
        .mockReturnValueOnce({ B: 'override', C: 'new' });
      const result = load_env(['.env.base', '.env.staging']);
      expect(mockReadFileSync).toHaveBeenCalledTimes(2);
      // expand is called once with the merged raw object
      expect(mockExpand).toHaveBeenCalledWith({
        parsed: { A: 'base', B: 'override', C: 'new' },
      });
      expect(result).toEqual({ A: 'base', B: 'override', C: 'new' });
    });

    it('expands $VAR references using dotenv-expand', () => {
      mockReadFileSync.mockReturnValueOnce('BASE=https://api.com\nURL=$BASE/v1');
      mockParse.mockReturnValueOnce({ BASE: 'https://api.com', URL: '$BASE/v1' });
      mockExpand.mockReturnValueOnce({
        parsed: { BASE: 'https://api.com', URL: 'https://api.com/v1' },
      });
      const result = load_env('.env');
      expect(result).toEqual({
        BASE: 'https://api.com',
        URL: 'https://api.com/v1',
      });
    });

    it('expands cross-file $VAR references when merging multiple files', () => {
      mockReadFileSync
        .mockReturnValueOnce('BASE_URL=https://api.com')
        .mockReturnValueOnce('API_URL=$BASE_URL/v1');
      mockParse
        .mockReturnValueOnce({ BASE_URL: 'https://api.com' })
        .mockReturnValueOnce({ API_URL: '$BASE_URL/v1' });
      // Expand is called with merged raw — so cross-file reference resolves
      mockExpand.mockReturnValueOnce({
        parsed: {
          BASE_URL: 'https://api.com',
          API_URL: 'https://api.com/v1',
        },
      });
      const result = load_env(['.env.base', '.env.staging']);
      expect(mockExpand).toHaveBeenCalledWith({
        parsed: { BASE_URL: 'https://api.com', API_URL: '$BASE_URL/v1' },
      });
      expect(result).toEqual({
        BASE_URL: 'https://api.com',
        API_URL: 'https://api.com/v1',
      });
    });
  });

  describe('yaml format', () => {
    it.each`
      extension
      ${'yml'}
      ${'yaml'}
    `(
      "reads yaml when extension is '.$extension'",
      ({ extension }: { extension: string }) => {
        mockReadFileSync.mockReturnValueOnce(Buffer.from('data'));
        mockYaml.mockReturnValueOnce({ hello: 'world' });
        const result = load_env(`hello.${extension}`);
        expect(mockReadFileSync).toHaveBeenCalledWith(`hello.${extension}`);
        expect(mockYaml).toHaveBeenCalledWith('data');
        expect(result).toEqual({ hello: 'world' });
      }
    );

    it('merges multiple yaml files, last file wins for conflicts', () => {
      mockReadFileSync
        .mockReturnValueOnce(Buffer.from('A: base\nB: base'))
        .mockReturnValueOnce(Buffer.from('B: override\nC: new'));
      mockYaml
        .mockReturnValueOnce({ A: 'base', B: 'base' })
        .mockReturnValueOnce({ B: 'override', C: 'new' });
      const result = load_env(['base.yaml', 'staging.yaml']);
      expect(mockReadFileSync).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ A: 'base', B: 'override', C: 'new' });
    });

    describe.each`
      extension
      ${'yml'}
      ${'yaml'}
    `(
      "throws when yaml is not an object with extension '.$extension'",
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

  describe('edge cases', () => {
    it('throws when no files are provided', () => {
      expect(() => load_env([])).toThrow(
        'No env file specified'
      );
    });
  });
});
