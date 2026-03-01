import * as path from 'path';
import * as fs from 'fs';
import handlebars from 'handlebars';

import type { FlatConfig } from './flatten';
import type { RC } from './resolve-env';
import type { FileMap } from './write-env';

const code_file_name = 'ConfigValues';
const config_file_name = 'rncu';

// ─── Handlebars helpers (registered once at module load, not per-call) ────────

function is_string(value: unknown): boolean {
  return typeof value === 'string';
}

function is_number(value: unknown): boolean {
  return typeof value === 'number';
}

function is_boolean(value: unknown): boolean {
  return typeof value === 'boolean';
}

function escape(value: unknown): unknown {
  if (is_string(value)) {
    return (value as string)
      .replace(/\\/gm, '\\\\')
      .replace(/"/gm, '\\"')
      .replace(/\n/gm, '\\n')
      .replace(/\r/gm, '\\r');
  }
  return value;
}

function xcconfig_format(value: unknown): unknown {
  if (is_string(value)) {
    return (value as string).replace(/\/\//gm, '/$()/');
  }
  return value;
}

function to_json(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

handlebars.registerHelper('isBoolean', is_boolean);
handlebars.registerHelper('isString', is_string);
handlebars.registerHelper('isNumber', is_number);
handlebars.registerHelper('escape', escape);
handlebars.registerHelper('xcconfigFormat', xcconfig_format);
handlebars.registerHelper('toJSON', to_json);

// ─── Template cache (compiled once per template name, not per build) ──────────

const template_cache = new Map<string, HandlebarsTemplateDelegate>();

function get_compiled_template(template_name: string): HandlebarsTemplateDelegate {
  const cached = template_cache.get(template_name);
  if (cached) return cached;

  const template_path = path.join(
    __dirname,
    'templates',
    `${template_name}.handlebars`
  );
  const compiled = handlebars.compile(fs.readFileSync(template_path, 'utf8'));
  template_cache.set(template_name, compiled);
  return compiled;
}

function render_template(template_name: string, data: unknown): string {
  return get_compiled_template(template_name)(data);
}

// ─── Public API ───────────────────────────────────────────────────────────────

interface PlatformEnv {
  ios: FlatConfig;
  android: FlatConfig;
  web: FlatConfig;
}

export default function render_env(
  project_root: string,
  lib_root: string,
  env: PlatformEnv,
  rc?: RC
): FileMap {
  const { ios, android, web } = env;
  const map: FileMap = {
    [path.join(lib_root, 'index.d.ts')]: render_template('index.d.ts', ios),
    [path.join(lib_root, 'index.web.js')]: render_template('index.web.js', web),
    [path.join(lib_root, 'ios', `${code_file_name}.h`)]: render_template(
      'ConfigValues.h',
      ios
    ),
    [path.join(lib_root, 'android', 'rncu.yaml')]: render_template(
      'rncu.yaml',
      android
    ),
  };

  // Only write xcconfig if the project has an ios folder.
  // All RN apps have it; some react-native-web apps may not.
  if (fs.existsSync(path.join(project_root, 'ios'))) {
    map[path.join(project_root, 'ios', `${config_file_name}.xcconfig`)] =
      render_template('rncu.xcconfig', ios);
  }

  const js_override = rc && typeof rc.js_override === 'boolean' && rc.js_override;
  map[path.join(lib_root, 'override.js')] = render_template('override.js', {
    ios: js_override ? ios : {},
    android: js_override ? android : {},
  });

  return map;
}
