import assert from 'assert';

type Platform = 'ios' | 'android' | 'web';
export type ConfigValue = string | number | boolean;
export type PerPlatformValue = Partial<Record<Platform, ConfigValue>>;
export type EnvConfig = Record<string, ConfigValue | PerPlatformValue>;
export type FlatConfig = Record<string, ConfigValue | undefined>;

const VALID_PLATFORMS: Platform[] = ['ios', 'android', 'web'];

export default function flatten(config: EnvConfig, platform: Platform): FlatConfig {
  assert(config && typeof config === 'object', 'Config should be non-null object');
  assert(
    VALID_PLATFORMS.includes(platform),
    '`platform` should one of: ' + VALID_PLATFORMS.join(', ')
  );
  const result: FlatConfig = {};
  for (const [key, value] of Object.entries(config)) {
    if (value && typeof value === 'object') {
      result[key] = (value as PerPlatformValue)[platform];
    } else {
      result[key] = value as ConfigValue;
    }
  }
  return result;
}
