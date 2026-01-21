import { Request, RequestHandler } from 'express';
import { z, ZodSchema } from 'zod';

import { AppError } from '../errors/app-error';
import { ValidationDetail } from '../types/api';

/**
 * Configuration for validation schemas.
 */
export interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

/**
 * Maps Zod issues to ValidationDetail format.
 */
function mapZodErrors(error: z.ZodError, source: string): ValidationDetail[] {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join('.') : source;
    return {
      field: source === 'body' ? path : `${source}.${path}`,
      message: issue.message,
    };
  });
}

/**
 * Validation middleware factory.
 * Validates request body, query, and params against Zod schemas.
 *
 * @example
 * const loginSchema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(8),
 * });
 *
 * router.post('/login', validate({ body: loginSchema }), authController.login);
 */
export const validate = (schemas: ValidationSchemas): RequestHandler => {
  return (req, _res, next) => {
    const errors: ValidationDetail[] = [];

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        errors.push(...mapZodErrors(result.error, 'body'));
      } else {
        req.body = result.data;
      }
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        errors.push(...mapZodErrors(result.error, 'query'));
      } else {
        (req as Request).query = result.data as Request['query'];
      }
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        errors.push(...mapZodErrors(result.error, 'params'));
      } else {
        (req as Request).params = result.data as Request['params'];
      }
    }

    if (errors.length > 0) {
      throw AppError.validation('Validation failed', errors);
    }

    next();
  };
};

/**
 * Shorthand for body-only validation.
 */
export const validateBody = (schema: ZodSchema): RequestHandler => {
  return validate({ body: schema });
};

/**
 * Shorthand for query-only validation.
 */
export const validateQuery = (schema: ZodSchema): RequestHandler => {
  return validate({ query: schema });
};

/**
 * Shorthand for params-only validation.
 */
export const validateParams = (schema: ZodSchema): RequestHandler => {
  return validate({ params: schema });
};
