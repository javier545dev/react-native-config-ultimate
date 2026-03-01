const mockWriteFile = jest.fn();
jest.mock('fs', () => ({ writeFileSync: mockWriteFile }));
// eslint-disable-next-line @typescript-eslint/no-require-imports
const write_env: (env: Record<string, string>) => void = require('./write-env').default;

describe('load-env', () => {
  beforeEach(() => {
    mockWriteFile.mockReset();
  });
  it('writes files', () => {
    write_env({ hello: 'world', hey: 'you' });
    expect(mockWriteFile).toHaveBeenCalledWith('hello', 'world');
    expect(mockWriteFile).toHaveBeenCalledWith('hey', 'you');
  });
});
