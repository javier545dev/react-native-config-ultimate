import { validate_env } from './validate-env';
import type { Schema } from './resolve-env';

describe('validate-env', () => {
  describe('required fields', () => {
    it('throws when a required var is missing', () => {
      const schema: Schema = { API_KEY: { type: 'string', required: true } };
      expect(() => validate_env({}, schema)).toThrow('Missing required env var: API_KEY');
    });

    it('throws when a required var is an empty string', () => {
      const schema: Schema = { API_KEY: { type: 'string', required: true } };
      expect(() => validate_env({ API_KEY: '' }, schema)).toThrow(
        'Missing required env var: API_KEY'
      );
    });

    it('throws when a required var is null', () => {
      const schema: Schema = { API_KEY: { type: 'string', required: true } };
      expect(() => validate_env({ API_KEY: null }, schema)).toThrow(
        'Missing required env var: API_KEY'
      );
    });

    it('does not throw when a required var is present', () => {
      const schema: Schema = { API_KEY: { type: 'string', required: true } };
      expect(() => validate_env({ API_KEY: 'my-key' }, schema)).not.toThrow();
    });

    it('does not throw when an optional var is missing', () => {
      const schema: Schema = { DEBUG: { type: 'boolean', required: false } };
      expect(() => validate_env({}, schema)).not.toThrow();
    });

    it('does not throw when required is not specified and var is missing', () => {
      const schema: Schema = { DEBUG: { type: 'boolean' } };
      expect(() => validate_env({}, schema)).not.toThrow();
    });
  });

  describe('type validation', () => {
    describe('number', () => {
      it('accepts valid number strings', () => {
        const schema: Schema = { TIMEOUT: { type: 'number' } };
        expect(() => validate_env({ TIMEOUT: '3000' }, schema)).not.toThrow();
        expect(() => validate_env({ TIMEOUT: '0' }, schema)).not.toThrow();
        expect(() => validate_env({ TIMEOUT: '-1' }, schema)).not.toThrow();
        expect(() => validate_env({ TIMEOUT: '3.14' }, schema)).not.toThrow();
      });

      it('throws for non-numeric strings', () => {
        const schema: Schema = { TIMEOUT: { type: 'number' } };
        expect(() => validate_env({ TIMEOUT: 'fast' }, schema)).toThrow(
          'TIMEOUT must be a number, got "fast"'
        );
        expect(() => validate_env({ TIMEOUT: 'abc' }, schema)).toThrow(
          'TIMEOUT must be a number'
        );
      });

      it('accepts actual number values', () => {
        const schema: Schema = { TIMEOUT: { type: 'number' } };
        expect(() => validate_env({ TIMEOUT: 3000 }, schema)).not.toThrow();
      });
    });

    describe('boolean', () => {
      it('accepts valid boolean strings', () => {
        const schema: Schema = { DEBUG: { type: 'boolean' } };
        for (const v of ['true', 'false', '1', '0', 'TRUE', 'FALSE']) {
          expect(() => validate_env({ DEBUG: v }, schema)).not.toThrow();
        }
      });

      it('throws for invalid boolean strings', () => {
        const schema: Schema = { DEBUG: { type: 'boolean' } };
        expect(() => validate_env({ DEBUG: 'yes' }, schema)).toThrow(
          'DEBUG must be a boolean (true/false/1/0), got "yes"'
        );
        expect(() => validate_env({ DEBUG: 'enabled' }, schema)).toThrow(
          'DEBUG must be a boolean'
        );
      });
    });

    describe('string', () => {
      it('accepts any non-empty value as string', () => {
        const schema: Schema = { NAME: { type: 'string' } };
        expect(() => validate_env({ NAME: 'hello' }, schema)).not.toThrow();
        expect(() => validate_env({ NAME: '123' }, schema)).not.toThrow();
        expect(() => validate_env({ NAME: 'true' }, schema)).not.toThrow();
      });
    });
  });

  describe('pattern validation', () => {
    it('accepts values matching the pattern', () => {
      const schema: Schema = {
        ENV: { type: 'string', pattern: '^(dev|staging|prod)$' },
      };
      expect(() => validate_env({ ENV: 'dev' }, schema)).not.toThrow();
      expect(() => validate_env({ ENV: 'staging' }, schema)).not.toThrow();
      expect(() => validate_env({ ENV: 'prod' }, schema)).not.toThrow();
    });

    it('throws for values not matching the pattern', () => {
      const schema: Schema = {
        ENV: { type: 'string', pattern: '^(dev|staging|prod)$' },
      };
      expect(() => validate_env({ ENV: 'production' }, schema)).toThrow(
        'ENV does not match pattern /^(dev|staging|prod)$/, got "production"'
      );
    });

    it('pattern validation is skipped for missing optional vars', () => {
      const schema: Schema = {
        ENV: { type: 'string', pattern: '^(dev|staging|prod)$' },
      };
      expect(() => validate_env({}, schema)).not.toThrow();
    });
  });

  describe('multiple errors', () => {
    it('reports all validation errors at once, not just the first', () => {
      const schema: Schema = {
        API_KEY: { type: 'string', required: true },
        TIMEOUT: { type: 'number', required: true },
        ENV: { type: 'string', pattern: '^(dev|staging|prod)$' },
      };
      let error: Error | undefined;
      try {
        validate_env({ TIMEOUT: 'fast', ENV: 'production' }, schema);
      } catch (e) {
        error = e as Error;
      }
      expect(error).toBeDefined();
      expect(error?.message).toContain('Missing required env var: API_KEY');
      expect(error?.message).toContain('TIMEOUT must be a number');
      expect(error?.message).toContain('ENV does not match pattern');
    });
  });

  describe('does not throw for valid env', () => {
    it('passes a complete valid env without error', () => {
      const schema: Schema = {
        API_KEY: { type: 'string', required: true },
        TIMEOUT_MS: { type: 'number', required: true },
        DEBUG: { type: 'boolean', required: false },
        ENV_NAME: { type: 'string', required: true, pattern: '^(dev|staging|prod)$' },
      };
      expect(() =>
        validate_env(
          {
            API_KEY: 'secret-key',
            TIMEOUT_MS: '5000',
            ENV_NAME: 'staging',
            // DEBUG intentionally omitted (optional)
          },
          schema
        )
      ).not.toThrow();
    });
  });

  describe('env key name validation', () => {
    it('throws for keys with invalid characters', () => {
      const schema: Schema = {};
      expect(() => validate_env({ 'invalid-key': 'value' }, schema)).toThrow(
        'Invalid env key name: "invalid-key"'
      );
    });

    it('throws for keys starting with a number', () => {
      const schema: Schema = {};
      expect(() => validate_env({ '123KEY': 'value' }, schema)).toThrow(
        'Invalid env key name: "123KEY"'
      );
    });

    it('throws for keys with spaces', () => {
      const schema: Schema = {};
      expect(() => validate_env({ 'MY KEY': 'value' }, schema)).toThrow(
        'Invalid env key name: "MY KEY"'
      );
    });

    it('accepts valid key names starting with underscore', () => {
      const schema: Schema = {};
      expect(() => validate_env({ _PRIVATE_KEY: 'value' }, schema)).not.toThrow();
    });

    it('accepts valid key names with numbers', () => {
      const schema: Schema = {};
      expect(() => validate_env({ API_V2_URL: 'value' }, schema)).not.toThrow();
    });
  });

  describe('invalid regex patterns', () => {
    it('reports error for invalid regex in schema', () => {
      const schema: Schema = {
        ENV: { type: 'string', pattern: '[invalid(' },
      };
      expect(() => validate_env({ ENV: 'test' }, schema)).toThrow(
        'invalid regex pattern /[invalid(/'
      );
    });

    it('reports multiple invalid regex patterns', () => {
      const schema: Schema = {
        ENV1: { type: 'string', pattern: '[bad1(' },
        ENV2: { type: 'string', pattern: '[bad2(' },
      };
      let error: Error | undefined;
      try {
        validate_env({ ENV1: 'a', ENV2: 'b' }, schema);
      } catch (e) {
        error = e as Error;
      }
      expect(error?.message).toContain('ENV1: invalid regex pattern');
      expect(error?.message).toContain('ENV2: invalid regex pattern');
    });
  });
});
