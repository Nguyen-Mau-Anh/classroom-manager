import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodError } from 'zod';

import { AppError } from '../errors/app-error';
import { logger } from '../lib/logger';
import { ErrorCode, ValidationDetail } from '../types/api';

/**
 * Global error handler middleware.
 * Must be registered last in the middleware chain.
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  const requestId = req.id;

  // Handle AppError (our custom errors)
  if (err instanceof AppError) {
    logger.warn({
      err,
      requestId,
      code: err.code,
      statusCode: err.statusCode,
    });

    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && err.details.length > 0 && { details: err.details }),
        ...(requestId && { requestId }),
      },
    });
    return;
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const details: ValidationDetail[] = err.issues.map((zodIssue) => ({
      field: zodIssue.path.join('.'),
      message: zodIssue.message,
    }));

    logger.warn({
      err,
      requestId,
      code: ErrorCode.VALIDATION_ERROR,
      details,
    });

    res.status(400).json({
      success: false,
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Validation failed',
        details,
        ...(requestId && { requestId }),
      },
    });
    return;
  }

  // Handle unknown errors - log full stack trace but don't expose to client
  logger.error({
    err,
    requestId,
    stack: err.stack,
    message: err.message,
  });

  res.status(500).json({
    success: false,
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message: 'Internal server error',
      ...(requestId && { requestId }),
    },
  });
}

/**
 * Not found handler for undefined routes.
 * Should be registered after all route handlers.
 */
export function notFoundHandler(req: Request, res: Response): void {
  const requestId = req.id;

  logger.info({
    requestId,
    path: req.path,
    method: req.method,
    message: 'Route not found',
  });

  res.status(404).json({
    success: false,
    error: {
      code: ErrorCode.NOT_FOUND,
      message: `Cannot ${req.method} ${req.path}`,
      ...(requestId && { requestId }),
    },
  });
}

/**
 * Wraps async route handlers to catch Promise rejections.
 * Use this wrapper for all async route handlers.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
