import * as dotenv from 'dotenv';
import * as yaml from 'js-yaml';
import * as path from 'path';
import * as fs from 'fs';

import type { EnvData } from './resolve-env';

function read(config_path: string): unknown {
  const { ext } = path.parse(config_path);
  if (ext === '.yml' || ext === '.yaml') {
    const data = fs.readFileSync(config_path).toString();
    return yaml.load(data);
  } else {
    const data = dotenv.config({ path: config_path });
    return data.parsed;
  }
}

export default function load_env(config_path: string): EnvData {
  const data = read(config_path);
  if (typeof data === 'undefined' || data === null || typeof data !== 'object') {
    throw new Error(
      `Expected to read object from ${config_path}, but got '${data}'`
    );
  }
  return data as EnvData;
}
