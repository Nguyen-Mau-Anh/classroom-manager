import type { IncomingMessage, ServerResponse } from 'http';

import pinoHttpFactory, { HttpLogger } from 'pino-http';

import { logger } from '../lib/logger';

/**
 * HTTP request logging middleware using pino-http.
 * Logs request details and response time.
 */
export const requestLogger: HttpLogger = pinoHttpFactory({
  logger,
  // Use request ID from our middleware
  genReqId: (req) => (req as IncomingMessage & { id?: string }).id,
  // Custom log level based on status code
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) {
      return 'error';
    }
    if (res.statusCode >= 400) {
      return 'warn';
    }
    return 'info';
  },
  // Custom success message
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },
  // Custom error message
  customErrorMessage: (req, res) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },
  // Custom attributes to log
  customAttributeKeys: {
    req: 'request',
    res: 'response',
    err: 'error',
    responseTime: 'duration',
  },
  // Serialize request
  serializers: {
    req: (req: IncomingMessage & { query?: unknown; params?: unknown }) => ({
      method: req.method,
      url: req.url,
      query: req.query,
      params: req.params,
    }),
    res: (res: ServerResponse) => ({
      statusCode: res.statusCode,
    }),
  },
});
