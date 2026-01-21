import pinoFactory, { Logger, Bindings } from 'pino';

const isProduction = process.env.NODE_ENV === 'production';
const logLevel = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

/**
 * Configured Pino logger instance.
 * - Uses pino-pretty for development formatting
 * - Redacts sensitive fields like authorization headers and passwords
 * - Log level is configurable via LOG_LEVEL env var
 */
export const logger = pinoFactory({
  level: logLevel,
  transport: !isProduction
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  redact: {
    paths: ['req.headers.authorization', 'password', 'passwordHash', 'refreshToken', 'accessToken'],
    remove: true,
  },
  base: {
    env: process.env.NODE_ENV,
  },
});

/**
 * Creates a child logger with additional context.
 */
export function createChildLogger(bindings: Bindings): Logger {
  return logger.child(bindings);
}
