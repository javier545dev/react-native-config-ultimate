import * as path from 'path';
import * as fs from 'fs';
import render_env from './render-env';

// We need to mock fs for some tests, but test helpers with real handlebars
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
}));

const mock_exists_sync = fs.existsSync as jest.MockedFunction<typeof fs.existsSync>;
const mock_read_file_sync = fs.readFileSync as jest.MockedFunction<typeof fs.readFileSync>;

describe('render-env', () => {
  const project_root = '/project';
  const lib_root = '/project/node_modules/react-native-config-ultimate';

  const sample_env = {
    ios: { API_URL: 'https://api.com', DEBUG: true, PORT: 3000 },
    android: { API_URL: 'https://api.com', DEBUG: true, PORT: 3000 },
    web: { API_URL: 'https://api.com', DEBUG: true, PORT: 3000 },
  };

  beforeEach(() => {
    mock_exists_sync.mockReset();
    mock_read_file_sync.mockReset();

    // Default: ios folder exists
    mock_exists_sync.mockImplementation((p: fs.PathLike) => {
      const path_str = p.toString();
      // ios folder exists
      if (path_str === path.join(project_root, 'ios')) return true;
      // template files exist (use real fs for templates)
      if (path_str.includes('templates')) {
        return (jest.requireActual('fs') as typeof fs).existsSync(p);
      }
      return false;
    });

    // For templates, use real fs
    mock_read_file_sync.mockImplementation((p: fs.PathOrFileDescriptor, options?: unknown) => {
      const path_str = p.toString();
      if (path_str.includes('templates')) {
        return (jest.requireActual('fs') as typeof fs).readFileSync(p, options as BufferEncoding);
      }
      return 'mocked content';
    });
  });

  describe('file generation', () => {
    it('generates index.d.ts in lib root', () => {
      const result = render_env(project_root, lib_root, sample_env);
      const expected_path = path.join(lib_root, 'index.d.ts');
      expect(result[expected_path]).toBeDefined();
    });

    it('generates index.web.js in lib root', () => {
      const result = render_env(project_root, lib_root, sample_env);
      const expected_path = path.join(lib_root, 'index.web.js');
      expect(result[expected_path]).toBeDefined();
    });

    it('generates ConfigValues.h in ios folder', () => {
      const result = render_env(project_root, lib_root, sample_env);
      const expected_path = path.join(lib_root, 'ios', 'ConfigValues.h');
      expect(result[expected_path]).toBeDefined();
    });

    it('generates rncu.yaml in android folder', () => {
      const result = render_env(project_root, lib_root, sample_env);
      const expected_path = path.join(lib_root, 'android', 'rncu.yaml');
      expect(result[expected_path]).toBeDefined();
    });

    it('generates rncu.xcconfig in project ios folder when it exists', () => {
      const result = render_env(project_root, lib_root, sample_env);
      const expected_path = path.join(project_root, 'ios', 'rncu.xcconfig');
      expect(result[expected_path]).toBeDefined();
    });

    it('does NOT generate rncu.xcconfig when project has no ios folder', () => {
      mock_exists_sync.mockImplementation((p: fs.PathLike) => {
        const path_str = p.toString();
        // ios folder does NOT exist
        if (path_str === path.join(project_root, 'ios')) return false;
        // template files exist (use real fs for templates)
        if (path_str.includes('templates')) {
          return (jest.requireActual('fs') as typeof fs).existsSync(p);
        }
        return false;
      });

      const result = render_env(project_root, lib_root, sample_env);
      const xcconfig_path = path.join(project_root, 'ios', 'rncu.xcconfig');
      expect(result[xcconfig_path]).toBeUndefined();
    });

    it('generates override.js in lib root', () => {
      const result = render_env(project_root, lib_root, sample_env);
      const expected_path = path.join(lib_root, 'override.js');
      expect(result[expected_path]).toBeDefined();
    });
  });

  describe('js_override RC option', () => {
    it('passes empty objects to override.js when js_override is false', () => {
      const result = render_env(project_root, lib_root, sample_env, { js_override: false });
      const override_path = path.join(lib_root, 'override.js');
      const content = result[override_path];

      // The override.js template uses IOS_DATA and ANDROID_DATA variables
      expect(content).toContain('IOS_DATA = {}');
      expect(content).toContain('ANDROID_DATA = {}');
    });

    it('passes empty objects to override.js when js_override is undefined', () => {
      const result = render_env(project_root, lib_root, sample_env, undefined);
      const override_path = path.join(lib_root, 'override.js');
      const content = result[override_path];

      expect(content).toContain('IOS_DATA = {}');
      expect(content).toContain('ANDROID_DATA = {}');
    });

    it('passes full env to override.js when js_override is true', () => {
      const result = render_env(project_root, lib_root, sample_env, { js_override: true });
      const override_path = path.join(lib_root, 'override.js');
      const content = result[override_path];

      // Should contain actual env values
      expect(content).toContain('API_URL');
      expect(content).toContain('https://api.com');
    });
  });

  describe('template content', () => {
    it('index.d.ts contains type declarations for ios env keys', () => {
      const result = render_env(project_root, lib_root, sample_env);
      const content = result[path.join(lib_root, 'index.d.ts')];

      expect(content).toContain('API_URL');
      expect(content).toContain('DEBUG');
      expect(content).toContain('PORT');
    });

    it('index.web.js contains web env values', () => {
      const result = render_env(project_root, lib_root, sample_env);
      const content = result[path.join(lib_root, 'index.web.js')];

      expect(content).toContain('API_URL');
      expect(content).toContain('https://api.com');
    });

    it('rncu.yaml contains android env values', () => {
      const result = render_env(project_root, lib_root, sample_env);
      const content = result[path.join(lib_root, 'android', 'rncu.yaml')];

      expect(content).toContain('API_URL');
    });

    it('rncu.xcconfig contains ios env values with xcconfig escaping', () => {
      const result = render_env(project_root, lib_root, sample_env);
      const content = result[path.join(project_root, 'ios', 'rncu.xcconfig')];

      // xcconfig escapes // to /$()/ 
      expect(content).toContain('API_URL');
      expect(content).toContain('/$()/'); // https:// becomes https:/$()/ 
    });
  });
});

describe('handlebars helpers (via template output)', () => {
  // Test helpers indirectly through actual rendered output
  const project_root = '/project';
  const lib_root = '/project/node_modules/react-native-config-ultimate';

  beforeEach(() => {
    mock_exists_sync.mockImplementation((p: fs.PathLike) => {
      const path_str = p.toString();
      if (path_str === path.join(project_root, 'ios')) return true;
      if (path_str.includes('templates')) {
        return (jest.requireActual('fs') as typeof fs).existsSync(p);
      }
      return false;
    });

    mock_read_file_sync.mockImplementation((p: fs.PathOrFileDescriptor, options?: unknown) => {
      const path_str = p.toString();
      if (path_str.includes('templates')) {
        return (jest.requireActual('fs') as typeof fs).readFileSync(p, options as BufferEncoding);
      }
      return 'mocked content';
    });
  });

  describe('escape helper', () => {
    it('escapes backslashes in string values', () => {
      const env = {
        ios: { PATH: 'C:\\Users\\test' },
        android: { PATH: 'C:\\Users\\test' },
        web: { PATH: 'C:\\Users\\test' },
      };

      const result = render_env(project_root, lib_root, env);
      const content = result[path.join(lib_root, 'index.web.js')];

      // Backslashes should be escaped
      expect(content).toContain('\\\\');
    });

    it('escapes double quotes in string values', () => {
      const env = {
        ios: { MSG: 'say "hello"' },
        android: { MSG: 'say "hello"' },
        web: { MSG: 'say "hello"' },
      };

      const result = render_env(project_root, lib_root, env);
      const content = result[path.join(lib_root, 'index.web.js')];

      // Quotes should be escaped
      expect(content).toContain('\\"');
    });

    it('escapes newlines in string values', () => {
      const env = {
        ios: { MSG: 'line1\nline2' },
        android: { MSG: 'line1\nline2' },
        web: { MSG: 'line1\nline2' },
      };

      const result = render_env(project_root, lib_root, env);
      const content = result[path.join(lib_root, 'index.web.js')];

      // Newlines should be escaped as \\n
      expect(content).toContain('\\n');
    });
  });

  describe('xcconfig_format helper', () => {
    it('escapes // in URLs for xcconfig compatibility', () => {
      const env = {
        ios: { URL: 'https://example.com/path//double' },
        android: { URL: 'https://example.com' },
        web: { URL: 'https://example.com' },
      };

      const result = render_env(project_root, lib_root, env);
      const content = result[path.join(project_root, 'ios', 'rncu.xcconfig')];

      // // should become /$()/ in xcconfig
      expect(content).toContain('/$()');
    });
  });

  describe('type helpers', () => {
    it('handles boolean values correctly', () => {
      const env = {
        ios: { ENABLED: true, DISABLED: false },
        android: { ENABLED: true, DISABLED: false },
        web: { ENABLED: true, DISABLED: false },
      };

      const result = render_env(project_root, lib_root, env);
      const content = result[path.join(lib_root, 'index.web.js')];

      // Booleans should be rendered as true/false not "true"/"false"
      expect(content).toMatch(/ENABLED.*true/);
      expect(content).toMatch(/DISABLED.*false/);
    });

    it('handles number values correctly', () => {
      const env = {
        ios: { PORT: 3000, FLOAT: 3.14 },
        android: { PORT: 3000, FLOAT: 3.14 },
        web: { PORT: 3000, FLOAT: 3.14 },
      };

      const result = render_env(project_root, lib_root, env);
      const content = result[path.join(lib_root, 'index.web.js')];

      // Numbers should be rendered as numbers not strings
      expect(content).toMatch(/PORT.*3000/);
      expect(content).toMatch(/FLOAT.*3\.14/);
    });

    it('handles string values correctly', () => {
      const env = {
        ios: { NAME: 'test-app' },
        android: { NAME: 'test-app' },
        web: { NAME: 'test-app' },
      };

      const result = render_env(project_root, lib_root, env);
      const content = result[path.join(lib_root, 'index.web.js')];

      // Strings should be quoted
      expect(content).toContain('"test-app"');
    });
  });
});

describe('template caching', () => {
  const project_root = '/project';
  const lib_root = '/project/node_modules/react-native-config-ultimate';

  const sample_env = {
    ios: { KEY: 'value' },
    android: { KEY: 'value' },
    web: { KEY: 'value' },
  };

  beforeEach(() => {
    mock_exists_sync.mockImplementation((p: fs.PathLike) => {
      const path_str = p.toString();
      if (path_str === path.join(project_root, 'ios')) return true;
      if (path_str.includes('templates')) {
        return (jest.requireActual('fs') as typeof fs).existsSync(p);
      }
      return false;
    });

    mock_read_file_sync.mockImplementation((p: fs.PathOrFileDescriptor, options?: unknown) => {
      const path_str = p.toString();
      if (path_str.includes('templates')) {
        return (jest.requireActual('fs') as typeof fs).readFileSync(p, options as BufferEncoding);
      }
      return 'mocked content';
    });
  });

  it('produces consistent output across multiple calls', () => {
    const result1 = render_env(project_root, lib_root, sample_env);
    const result2 = render_env(project_root, lib_root, sample_env);

    // Same input should produce same output
    expect(result1).toEqual(result2);
  });

  it('produces different output for different env values', () => {
    const env1 = { ios: { A: 1 }, android: { A: 1 }, web: { A: 1 } };
    const env2 = { ios: { B: 2 }, android: { B: 2 }, web: { B: 2 } };

    const result1 = render_env(project_root, lib_root, env1);
    const result2 = render_env(project_root, lib_root, env2);

    const key = path.join(lib_root, 'index.d.ts');
    expect(result1[key]).not.toEqual(result2[key]);
  });
});
