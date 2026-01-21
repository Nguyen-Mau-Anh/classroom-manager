import { Request, Response } from 'express';
import { z } from 'zod';

import { AppError } from '../errors/app-error';

import { validate, validateBody, validateQuery, validateParams } from './validate.middleware';

describe('validate.middleware', () => {
  let mockReq: Request;
  let mockRes: Response;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      body: {},
      query: {},
      params: {},
    } as Request;
    mockRes = {} as Response;
    mockNext = jest.fn();
  });

  describe('validate', () => {
    describe('body validation', () => {
      const bodySchema = z.object({
        email: z.string().email(),
        password: z.string().min(8),
      });

      it('should pass validation with valid body', () => {
        mockReq.body = { email: 'test@example.com', password: 'password123' };
        const middleware = validate({ body: bodySchema });

        middleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
        expect(mockNext).toHaveBeenCalledTimes(1);
      });

      it('should transform body with parsed data', () => {
        mockReq.body = { email: 'test@example.com', password: 'password123', extra: 'ignored' };
        const middleware = validate({ body: bodySchema });

        middleware(mockReq, mockRes, mockNext);

        // Non-strict schema strips extra fields
        expect(mockReq.body).toEqual({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      it('should throw AppError.validation for invalid body', () => {
        mockReq.body = { email: 'invalid-email', password: 'short' };
        const middleware = validate({ body: bodySchema });

        expect(() => middleware(mockReq, mockRes, mockNext)).toThrow(AppError);

        try {
          middleware(mockReq, mockRes, mockNext);
        } catch (error) {
          expect(error).toBeInstanceOf(AppError);
          const appError = error as AppError;
          expect(appError.code).toBe('VALIDATION_ERROR');
          expect(appError.statusCode).toBe(400);
          expect(appError.details).toEqual(
            expect.arrayContaining([
              expect.objectContaining({ field: 'email' }),
              expect.objectContaining({ field: 'password' }),
            ]),
          );
        }
      });

      it('should not call next when validation fails', () => {
        mockReq.body = { email: 'invalid' };
        const middleware = validate({ body: bodySchema });

        try {
          middleware(mockReq, mockRes, mockNext);
        } catch {
          // Expected
        }

        expect(mockNext).not.toHaveBeenCalled();
      });
    });

    describe('query validation', () => {
      const querySchema = z.object({
        page: z.coerce.number().min(1),
        limit: z.coerce.number().min(1).max(100),
      });

      it('should pass validation with valid query', () => {
        mockReq.query = { page: '1', limit: '10' } as unknown as Request['query'];
        const middleware = validate({ query: querySchema });

        middleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
        // Query should be transformed to numbers
        expect(mockReq.query).toEqual({ page: 1, limit: 10 });
      });

      it('should throw AppError.validation for invalid query', () => {
        mockReq.query = { page: '0', limit: '200' } as unknown as Request['query'];
        const middleware = validate({ query: querySchema });

        try {
          middleware(mockReq, mockRes, mockNext);
        } catch (error) {
          expect(error).toBeInstanceOf(AppError);
          const appError = error as AppError;
          expect(appError.details).toEqual(
            expect.arrayContaining([
              expect.objectContaining({ field: 'query.page' }),
              expect.objectContaining({ field: 'query.limit' }),
            ]),
          );
        }
      });
    });

    describe('params validation', () => {
      const paramsSchema = z.object({
        id: z.string().uuid(),
      });

      it('should pass validation with valid params', () => {
        mockReq.params = { id: '550e8400-e29b-41d4-a716-446655440000' };
        const middleware = validate({ params: paramsSchema });

        middleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
      });

      it('should throw AppError.validation for invalid params', () => {
        mockReq.params = { id: 'not-a-uuid' };
        const middleware = validate({ params: paramsSchema });

        try {
          middleware(mockReq, mockRes, mockNext);
        } catch (error) {
          expect(error).toBeInstanceOf(AppError);
          const appError = error as AppError;
          expect(appError.details).toEqual([expect.objectContaining({ field: 'params.id' })]);
        }
      });
    });

    describe('combined validation', () => {
      it('should validate body, query, and params together', () => {
        const bodySchema = z.object({ name: z.string() });
        const querySchema = z.object({ includeDeleted: z.coerce.boolean() });
        const paramsSchema = z.object({ id: z.string() });

        mockReq.body = { name: 'Test' };
        mockReq.query = { includeDeleted: 'true' } as unknown as Request['query'];
        mockReq.params = { id: '123' };

        const middleware = validate({
          body: bodySchema,
          query: querySchema,
          params: paramsSchema,
        });

        middleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
        expect(mockReq.query).toEqual({ includeDeleted: true });
      });

      it('should collect errors from all sources', () => {
        const bodySchema = z.object({ name: z.string() });
        const querySchema = z.object({ page: z.coerce.number() });
        const paramsSchema = z.object({ id: z.string().uuid() });

        mockReq.body = {};
        mockReq.query = { page: 'invalid' } as unknown as Request['query'];
        mockReq.params = { id: 'not-uuid' };

        const middleware = validate({
          body: bodySchema,
          query: querySchema,
          params: paramsSchema,
        });

        try {
          middleware(mockReq, mockRes, mockNext);
        } catch (error) {
          expect(error).toBeInstanceOf(AppError);
          const appError = error as AppError;
          expect(appError.details?.length).toBeGreaterThanOrEqual(3);
        }
      });
    });

    describe('empty schemas', () => {
      it('should pass when no schemas are provided', () => {
        const middleware = validate({});

        middleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
      });
    });
  });

  describe('validateBody', () => {
    it('should be a shorthand for body-only validation', () => {
      const schema = z.object({ name: z.string() });
      mockReq.body = { name: 'Test' };

      const middleware = validateBody(schema);
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('validateQuery', () => {
    it('should be a shorthand for query-only validation', () => {
      const schema = z.object({ search: z.string() });
      mockReq.query = { search: 'test' } as unknown as Request['query'];

      const middleware = validateQuery(schema);
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('validateParams', () => {
    it('should be a shorthand for params-only validation', () => {
      const schema = z.object({ id: z.string() });
      mockReq.params = { id: '123' };

      const middleware = validateParams(schema);
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });
});
