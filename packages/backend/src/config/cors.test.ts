import type { CorsOptions } from 'cors';

interface CorsModule {
  getCorsAllowedOrigins: () => string[];
  corsConfig: CorsOptions;
}

describe('cors', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getCorsAllowedOrigins', () => {
    it('should return default origins when CORS_ORIGIN is not set', () => {
      delete process.env.CORS_ORIGIN;

      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      const { getCorsAllowedOrigins } = require('./cors') as CorsModule;
      const origins = getCorsAllowedOrigins();

      expect(origins).toContain('http://localhost:3000');
      expect(origins).toContain('http://localhost:5173');
    });

    it('should parse CORS_ORIGIN environment variable', () => {
      process.env.CORS_ORIGIN = 'https://example.com,https://app.example.com';

      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      const { getCorsAllowedOrigins } = require('./cors') as CorsModule;
      const origins = getCorsAllowedOrigins();

      expect(origins).toEqual(['https://example.com', 'https://app.example.com']);
    });

    it('should trim whitespace from origins', () => {
      process.env.CORS_ORIGIN = 'https://example.com , https://app.example.com';

      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      const { getCorsAllowedOrigins } = require('./cors') as CorsModule;
      const origins = getCorsAllowedOrigins();

      expect(origins).toEqual(['https://example.com', 'https://app.example.com']);
    });
  });

  describe('corsConfig', () => {
    describe('origin callback', () => {
      it('should allow requests with no origin', (done) => {
        delete process.env.CORS_ORIGIN;

        // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
        const { corsConfig } = require('./cors') as CorsModule;
        const originFn = corsConfig.origin as (
          origin: string | undefined,
          callback: (err: Error | null, allow?: boolean) => void
        ) => void;

        originFn(undefined, (err, allow) => {
          expect(err).toBeNull();
          expect(allow).toBe(true);
          done();
        });
      });

      it('should allow requests from allowed origins', (done) => {
        delete process.env.CORS_ORIGIN;

        // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
        const { corsConfig } = require('./cors') as CorsModule;
        const originFn = corsConfig.origin as (
          origin: string | undefined,
          callback: (err: Error | null, allow?: boolean) => void
        ) => void;

        originFn('http://localhost:3000', (err, allow) => {
          expect(err).toBeNull();
          expect(allow).toBe(true);
          done();
        });
      });

      it('should reject requests from unknown origins', (done) => {
        delete process.env.CORS_ORIGIN;

        // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
        const { corsConfig } = require('./cors') as CorsModule;
        const originFn = corsConfig.origin as (
          origin: string | undefined,
          callback: (err: Error | null, allow?: boolean) => void
        ) => void;

        originFn('https://evil.com', (err) => {
          expect(err).toBeInstanceOf(Error);
          expect(err?.message).toBe('Not allowed by CORS');
          done();
        });
      });
    });

    it('should have credentials enabled', () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      const { corsConfig } = require('./cors') as CorsModule;
      expect(corsConfig.credentials).toBe(true);
    });

    it('should have correct methods configured', () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      const { corsConfig } = require('./cors') as CorsModule;
      expect(corsConfig.methods).toEqual([
        'GET',
        'POST',
        'PUT',
        'PATCH',
        'DELETE',
        'OPTIONS',
      ]);
    });

    it('should have correct allowed headers', () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      const { corsConfig } = require('./cors') as CorsModule;
      expect(corsConfig.allowedHeaders).toContain('Content-Type');
      expect(corsConfig.allowedHeaders).toContain('Authorization');
      expect(corsConfig.allowedHeaders).toContain('X-Request-ID');
    });

    it('should expose X-Request-ID header', () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      const { corsConfig } = require('./cors') as CorsModule;
      expect(corsConfig.exposedHeaders).toContain('X-Request-ID');
    });
  });
});
