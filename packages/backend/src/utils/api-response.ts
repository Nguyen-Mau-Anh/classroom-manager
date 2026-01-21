import { Response } from 'express';

import { ApiSuccessResponse, ApiErrorResponse, ValidationDetail } from '../types/api';

/**
 * Sends a successful API response.
 */
export function success<T>(res: Response, data: T, statusCode = 200): Response {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
  };
  return res.status(statusCode).json(response);
}

/**
 * Sends an error API response.
 */
export function error(
  res: Response,
  code: string,
  message: string,
  statusCode = 500,
  details?: ValidationDetail[],
  requestId?: string
): Response {
  const response: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && details.length > 0 && { details }),
      ...(requestId && { requestId }),
    },
  };
  return res.status(statusCode).json(response);
}

/**
 * Sends a validation error API response.
 */
export function validationError(
  res: Response,
  message: string,
  details: ValidationDetail[],
  requestId?: string
): Response {
  return error(res, 'VALIDATION_ERROR', message, 400, details, requestId);
}

/**
 * Sends a not found error API response.
 */
export function notFoundError(res: Response, resource: string, requestId?: string): Response {
  return error(res, 'NOT_FOUND', `${resource} not found`, 404, undefined, requestId);
}

/**
 * Sends an unauthorized error API response.
 */
export function unauthorizedError(
  res: Response,
  message = 'Unauthorized',
  requestId?: string
): Response {
  return error(res, 'UNAUTHORIZED', message, 401, undefined, requestId);
}

/**
 * Sends a forbidden error API response.
 */
export function forbiddenError(
  res: Response,
  message = 'Forbidden',
  requestId?: string
): Response {
  return error(res, 'FORBIDDEN', message, 403, undefined, requestId);
}

/**
 * Sends an internal server error API response.
 */
export function internalError(
  res: Response,
  message = 'Internal server error',
  requestId?: string
): Response {
  return error(res, 'INTERNAL_ERROR', message, 500, undefined, requestId);
}

export const apiResponse = {
  success,
  error,
  validationError,
  notFoundError,
  unauthorizedError,
  forbiddenError,
  internalError,
};
