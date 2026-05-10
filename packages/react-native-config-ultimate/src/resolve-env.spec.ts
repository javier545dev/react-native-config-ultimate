import resolve_env from './resolve-env';
import type { EnvData } from './resolve-env';

describe('resolve_env', () => {
  const original: EnvData = { original: 'data' };

  it('returns env as-is when no rc is provided', async () => {
    expect(await resolve_env(original)).toEqual(original);
  });

  it('returns env as-is when rc exists but on_env is undefined', async () => {
    expect(await resolve_env(original, {})).toEqual(original);
  });

  it('returns hook result when hook returns an object', async () => {
    const on_env = jest.fn().mockReturnValue({ patched: true });
    expect(await resolve_env(original, { on_env })).toEqual({ patched: true });
  });

  it('returns original env when hook returns undefined (implicit void)', async () => {
    const on_env = jest.fn().mockReturnValue(undefined);
    expect(await resolve_env(original, { on_env })).toEqual(original);
  });

  it('supports async on_env hooks', async () => {
    const on_env = jest.fn().mockResolvedValue({ async_result: true });
    expect(await resolve_env(original, { on_env })).toEqual({ async_result: true });
  });

  it('throws when hook returns a non-object (string)', async () => {
    const on_env = jest.fn().mockReturnValue('hello');
    await expect(resolve_env(original, { on_env })).rejects.toThrow(
      'on_env hook must return an object'
    );
  });

  it('throws when hook returns a non-object (number)', async () => {
    const on_env = jest.fn().mockReturnValue(42);
    await expect(resolve_env(original, { on_env })).rejects.toThrow(
      'on_env hook must return an object'
    );
  });

  it('throws when hook returns null', async () => {
    const on_env = jest.fn().mockReturnValue(null);
    await expect(resolve_env(original, { on_env })).rejects.toThrow(
      'on_env hook must return an object'
    );
  });

  it('throws when hook returns an array', async () => {
    const on_env = jest.fn().mockReturnValue([1, 2, 3]);
    await expect(resolve_env(original, { on_env })).rejects.toThrow(
      'on_env hook must return an object'
    );
  });

  it('throws when hook returns false', async () => {
    const on_env = jest.fn().mockReturnValue(false);
    await expect(resolve_env(original, { on_env })).rejects.toThrow(
      'on_env hook must return an object'
    );
  });
});
