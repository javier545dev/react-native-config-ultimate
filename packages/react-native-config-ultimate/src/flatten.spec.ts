import flatten from './flatten';

describe('flatten', () => {
  it('flattens config per platform', () => {
    const config = {
      value1: 'abc',
      value2: { ios: 'def', android: 'xyz', web: '123' },
    };
    const flat_ios = flatten(config, 'ios');
    expect(flat_ios).toEqual({ value1: 'abc', value2: 'def' });
    const flat_android = flatten(config, 'android');
    expect(flat_android).toEqual({ value1: 'abc', value2: 'xyz' });
    const flat_web = flatten(config, 'web');
    expect(flat_web).toEqual({ value1: 'abc', value2: '123' });
  });

  it('omits keys where the requested platform is not defined', () => {
    const config = {
      SHARED: 'shared',
      IOS_ONLY: { ios: 'ios-val' },
      ANDROID_ONLY: { android: 'android-val' },
    };
    const flat_ios = flatten(config, 'ios');
    expect(flat_ios).toEqual({ SHARED: 'shared', IOS_ONLY: 'ios-val' });
    expect(flat_ios).not.toHaveProperty('ANDROID_ONLY');

    const flat_android = flatten(config, 'android');
    expect(flat_android).toEqual({ SHARED: 'shared', ANDROID_ONLY: 'android-val' });
    expect(flat_android).not.toHaveProperty('IOS_ONLY');
  });

  it('handles boolean and number values', () => {
    const config = {
      ENABLED: true,
      DISABLED: false,
      PORT: 3000,
      NAME: 'test',
    };
    const result = flatten(config, 'ios');
    expect(result).toEqual({ ENABLED: true, DISABLED: false, PORT: 3000, NAME: 'test' });
  });

  it('returns empty object for empty config', () => {
    expect(flatten({}, 'ios')).toEqual({});
  });

  it('throws for null config', () => {
    expect(() => flatten(null as never, 'ios')).toThrow('Config should be non-null object');
  });

  it('throws for invalid platform', () => {
    expect(() => flatten({}, 'windows' as never)).toThrow('`platform` should one of');
  });
});
