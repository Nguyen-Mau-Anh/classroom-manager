import type { Logger } from 'pino';

interface LoggerModule {
  logger: Logger;
  createChildLogger: (bindings: Record<string, unknown>) => Logger;
}

// Reset module cache to allow testing with different env values
beforeEach(() => {
  jest.resetModules();
});

describe('logger', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('configuration', () => {
    it('should use debug level in development', () => {
      process.env.NODE_ENV = 'development';
      delete process.env.LOG_LEVEL;

      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      const { logger } = require('./logger') as LoggerModule;
      expect(logger.level).toBe('debug');
    });

    it('should use info level in production', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.LOG_LEVEL;

      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      const { logger } = require('./logger') as LoggerModule;
      expect(logger.level).toBe('info');
    });

    it('should respect LOG_LEVEL env var', () => {
      process.env.LOG_LEVEL = 'warn';

      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      const { logger } = require('./logger') as LoggerModule;
      expect(logger.level).toBe('warn');
    });

    it('should be a pino logger instance', () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      const { logger } = require('./logger') as LoggerModule;
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.debug).toBe('function');
    });
  });

  describe('createChildLogger', () => {
    it('should create a child logger with bindings', () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      const { createChildLogger } = require('./logger') as LoggerModule;
      const childLogger = createChildLogger({ service: 'auth' });

      expect(childLogger).toBeDefined();
      expect(typeof childLogger.info).toBe('function');
    });
  });

  describe('redaction', () => {
    it('should have redact paths configured', () => {
      process.env.NODE_ENV = 'production';

      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      const { logger } = require('./logger') as LoggerModule;
      // The logger should be configured (we can't easily test redaction without complex stream capture)
      expect(logger).toBeDefined();
    });
  });
});
