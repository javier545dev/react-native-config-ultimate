const mockReadFileSync = jest.fn();
jest.doMock('fs', () => ({ readFileSync: mockReadFileSync }));

const mockParse = jest.fn();
jest.doMock('dotenv', () => ({ parse: mockParse }));

const mockExpand = jest.fn();
jest.doMock('dotenv-expand', () => ({ expand: mockExpand }));

const mockYaml = jest.fn();
jest.doMock('js-yaml', () => ({ load: mockYaml }));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const load_env: (
  paths: string | string[],
  project_root?: string
) => { data: Record<string, unknown>; sources: Array<{ path: string; sha256: string }> } =
  require('./load-env').default;

describe('load-env', () => {
  beforeEach(() => {
    mockReadFileSync.mockReset();
    mockParse.mockReset();
    mockExpand.mockReset();
    mockYaml.mockReset();
    // Default expand: return parsed as-is (no expansion side effects)
    mockExpand.mockImplementation((input: { parsed: Record<string, string> }) => input);
  });

  describe('dotenv format', () => {
    it('reads a single dotenv file (backward-compatible string arg)', () => {
      mockReadFileSync.mockReturnValueOnce('hello=world');
      mockParse.mockReturnValueOnce({ hello: 'world' });
      const result = load_env('hello', '/project');
      expect(mockReadFileSync).toHaveBeenCalledWith('hello', 'utf8');
      expect(mockParse).toHaveBeenCalledWith('hello=world');
      expect(result.data).toEqual({ hello: 'world' });
    });

    it('reads a single dotenv file when passed as an array', () => {
      mockReadFileSync.mockReturnValueOnce('hello=world');
      mockParse.mockReturnValueOnce({ hello: 'world' });
      const result = load_env(['hello'], '/project');
      expect(mockReadFileSync).toHaveBeenCalledWith('hello', 'utf8');
      expect(result.data).toEqual({ hello: 'world' });
    });

    it('merges multiple dotenv files, last file wins for conflicts', () => {
      mockReadFileSync
        .mockReturnValueOnce('A=base\nB=base')
        .mockReturnValueOnce('B=override\nC=new');
      mockParse
        .mockReturnValueOnce({ A: 'base', B: 'base' })
        .mockReturnValueOnce({ B: 'override', C: 'new' });
      const result = load_env(['.env.base', '.env.staging'], '/project');
      expect(mockReadFileSync).toHaveBeenCalledTimes(2);
      // expand is called once with the merged raw object
      expect(mockExpand).toHaveBeenCalledWith({
        parsed: { A: 'base', B: 'override', C: 'new' },
      });
      expect(result.data).toEqual({ A: 'base', B: 'override', C: 'new' });
    });

    it('expands $VAR references using dotenv-expand', () => {
      mockReadFileSync.mockReturnValueOnce('BASE=https://api.com\nURL=$BASE/v1');
      mockParse.mockReturnValueOnce({ BASE: 'https://api.com', URL: '$BASE/v1' });
      mockExpand.mockReturnValueOnce({
        parsed: { BASE: 'https://api.com', URL: 'https://api.com/v1' },
      });
      const result = load_env('.env', '/project');
      expect(result.data).toEqual({
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
      const result = load_env(['.env.base', '.env.staging'], '/project');
      expect(mockExpand).toHaveBeenCalledWith({
        parsed: { BASE_URL: 'https://api.com', API_URL: '$BASE_URL/v1' },
      });
      expect(result.data).toEqual({
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
    `("reads yaml when extension is '.$extension'", ({ extension }: { extension: string }) => {
      mockReadFileSync.mockReturnValueOnce('data');
      mockYaml.mockReturnValueOnce({ hello: 'world' });
      const result = load_env(`hello.${extension}`, '/project');
      expect(mockReadFileSync).toHaveBeenCalledWith(`hello.${extension}`, 'utf8');
      expect(mockYaml).toHaveBeenCalledWith('data');
      expect(result.data).toEqual({ hello: 'world' });
    });

    it('merges multiple yaml files, last file wins for conflicts', () => {
      mockReadFileSync
        .mockReturnValueOnce('A: base\nB: base')
        .mockReturnValueOnce('B: override\nC: new');
      mockYaml
        .mockReturnValueOnce({ A: 'base', B: 'base' })
        .mockReturnValueOnce({ B: 'override', C: 'new' });
      const result = load_env(['base.yaml', 'staging.yaml'], '/project');
      expect(mockReadFileSync).toHaveBeenCalledTimes(2);
      expect(result.data).toEqual({ A: 'base', B: 'override', C: 'new' });
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
          mockReadFileSync.mockReturnValueOnce(String('data'));
          mockYaml.mockReturnValueOnce(content);
          expect(() => {
            load_env(`hello.${extension}`, '/project');
          }).toThrow();
        });
      }
    );
  });

  describe('edge cases', () => {
    it('throws when no files are provided', () => {
      expect(() => load_env([], '/project')).toThrow('No env file specified');
    });

    it('rejects YAML values parsed as Date with a quoting hint', () => {
      // js-yaml returns a Date instance for unquoted ISO dates like 2024-01-01.
      mockReadFileSync.mockReturnValue(String('RELEASE_DATE: 2024-01-01'));
      mockYaml.mockReturnValue({ RELEASE_DATE: new Date('2024-01-01T00:00:00.000Z') });

      expect(() => load_env('config.yaml', '/project')).toThrow(
        /Unsupported value types[\s\S]*RELEASE_DATE: YAML parsed as Date/
      );
    });

    it('rejects YAML arrays with a clear message', () => {
      mockReadFileSync.mockReturnValueOnce(String('TAGS: [a, b]'));
      mockYaml.mockReturnValueOnce({ TAGS: ['a', 'b'] });

      expect(() => load_env('config.yaml', '/project')).toThrow(/arrays are not supported/);
    });

    it('lists multiple unsupported values in a single error', () => {
      mockReadFileSync.mockReturnValueOnce(String('data'));
      mockYaml.mockReturnValueOnce({
        DATE_KEY: new Date('2024-01-01'),
        ARRAY_KEY: [1, 2, 3],
        OK_KEY: 'fine',
      });

      expect(() => load_env('config.yaml', '/project')).toThrow(/DATE_KEY[\s\S]*ARRAY_KEY/);
    });
  });

  describe('mixed format (yaml + dotenv)', () => {
    it('merges yaml and dotenv files together', () => {
      // First file is yaml
      mockReadFileSync
        .mockReturnValueOnce(String('YAML_VAR: from_yaml'))
        .mockReturnValueOnce('DOTENV_VAR=from_dotenv');
      mockYaml.mockReturnValueOnce({ YAML_VAR: 'from_yaml' });
      mockParse.mockReturnValueOnce({ DOTENV_VAR: 'from_dotenv' });

      const result = load_env(['config.yaml', '.env'], '/project');

      expect(mockYaml).toHaveBeenCalled();
      expect(mockParse).toHaveBeenCalled();
      expect(result.data).toEqual({
        YAML_VAR: 'from_yaml',
        DOTENV_VAR: 'from_dotenv',
      });
    });

    it('dotenv file in mixed mode still gets expanded', () => {
      mockReadFileSync
        .mockReturnValueOnce(String('BASE: https://api.com'))
        .mockReturnValueOnce('URL=$BASE/v1');
      mockYaml.mockReturnValueOnce({ BASE: 'https://api.com' });
      mockParse.mockReturnValueOnce({ URL: '$BASE/v1' });
      // In mixed mode, expand is called per-dotenv-file
      mockExpand.mockReturnValueOnce({
        parsed: { URL: 'https://api.com/v1' },
      });

      const result = load_env(['config.yaml', '.env'], '/project');

      expect(result.data).toEqual({
        BASE: 'https://api.com',
        URL: 'https://api.com/v1',
      });
    });

    it('last file wins for conflicting keys in mixed mode', () => {
      mockReadFileSync
        .mockReturnValueOnce(String('SHARED: from_yaml'))
        .mockReturnValueOnce('SHARED=from_dotenv');
      mockYaml.mockReturnValueOnce({ SHARED: 'from_yaml' });
      mockParse.mockReturnValueOnce({ SHARED: 'from_dotenv' });

      const result = load_env(['config.yaml', '.env'], '/project');

      expect(result.data.SHARED).toBe('from_dotenv');
    });

    it('handles dotenv first, then yaml', () => {
      mockReadFileSync
        .mockReturnValueOnce('DOTENV_VAR=first')
        .mockReturnValueOnce(String('YAML_VAR: second'));
      mockParse.mockReturnValueOnce({ DOTENV_VAR: 'first' });
      mockYaml.mockReturnValueOnce({ YAML_VAR: 'second' });

      const result = load_env(['.env', 'config.yml'], '/project');

      expect(result.data).toEqual({
        DOTENV_VAR: 'first',
        YAML_VAR: 'second',
      });
    });
  });

  // ─── T6: sources[] with hashes ───────────────────────────────────────────────

  describe('sources[] — T6', () => {
    it('return type includes { data, sources }', () => {
      mockReadFileSync.mockReturnValueOnce('KEY=val');
      mockParse.mockReturnValueOnce({ KEY: 'val' });
      const result = load_env('.env.staging', '/project');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('sources');
      expect(Array.isArray(result.sources)).toBe(true);
    });

    it('sources[0].path is POSIX-relative to project_root (forward slashes)', () => {
      mockReadFileSync.mockReturnValueOnce('KEY=val');
      mockParse.mockReturnValueOnce({ KEY: 'val' });
      const result = load_env('.env.staging', '/project');
      expect(result.sources[0]?.path).toBe('.env.staging');
      expect(result.sources[0]?.path).not.toContain('\\');
    });

    it('sources[0].sha256 is a 64-char hex string derived from file content', () => {
      mockReadFileSync.mockReturnValueOnce('KEY=val');
      mockParse.mockReturnValueOnce({ KEY: 'val' });
      const result = load_env('.env.staging', '/project');
      expect(result.sources[0]?.sha256).toMatch(/^[0-9a-f]{64}$/);
    });

    it('multiple files produce one source entry per file', () => {
      mockReadFileSync
        .mockReturnValueOnce('A=1')
        .mockReturnValueOnce('B=2');
      mockParse
        .mockReturnValueOnce({ A: '1' })
        .mockReturnValueOnce({ B: '2' });
      const result = load_env(['.env.base', '.env.staging'], '/project');
      expect(result.sources).toHaveLength(2);
      expect(result.sources[0]?.path).toBe('.env.base');
      expect(result.sources[1]?.path).toBe('.env.staging');
    });

    it('path escaping project_root throws', () => {
      mockReadFileSync.mockReturnValueOnce('KEY=val');
      mockParse.mockReturnValueOnce({ KEY: 'val' });
      expect(() => load_env('../../outside/.env', '/project')).toThrow();
    });
  });
});
