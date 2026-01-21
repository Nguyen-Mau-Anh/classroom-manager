import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

import { AppError } from '../errors/app-error';
import type { ApiErrorResponse } from '../types/api';

import { errorHandler, notFoundHandler, asyncHandler } from './error-handler.middleware';

// Mock the logger
jest.mock('../lib/logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe('error-handler.middleware', () => {
  let mockReq: Request;
  let mockRes: Response;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockReq = {
      id: 'test-request-id',
      path: '/api/test',
      method: 'GET',
    } as Request;
    mockRes = {
      status: statusMock,
      json: jsonMock,
    } as unknown as Response;
    mockNext = jest.fn();
  });

  describe('errorHandler', () => {
    describe('AppError handling', () => {
      it('should handle AppError and return correct status code', () => {
        const error = AppError.validation('Validation failed', [
          { field: 'email', message: 'Invalid email' },
        ]);

        errorHandler(error, mockReq, mockRes, mockNext);

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: [{ field: 'email', message: 'Invalid email' }],
            requestId: 'test-request-id',
          },
        });
      });

      it('should handle AppError.notFound', () => {
        const error = AppError.notFound('User');

        errorHandler(error, mockReq, mockRes, mockNext);

        expect(statusMock).toHaveBeenCalledWith(404);
        expect(jsonMock).toHaveBeenCalledWith({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'User not found',
            requestId: 'test-request-id',
          },
        });
      });

      it('should handle AppError.unauthorized', () => {
        const error = AppError.unauthorized('Token expired');

        errorHandler(error, mockReq, mockRes, mockNext);

        expect(statusMock).toHaveBeenCalledWith(401);
        expect(jsonMock).toHaveBeenCalledWith({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Token expired',
            requestId: 'test-request-id',
          },
        });
      });

      it('should handle AppError.forbidden', () => {
        const error = AppError.forbidden('Admin only');

        errorHandler(error, mockReq, mockRes, mockNext);

        expect(statusMock).toHaveBeenCalledWith(403);
        expect(jsonMock).toHaveBeenCalledWith({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Admin only',
            requestId: 'test-request-id',
          },
        });
      });

      it('should not include empty details in response', () => {
        const error = new AppError('TEST_ERROR', 'Test message', 400, []);

        errorHandler(error, mockReq, mockRes, mockNext);

        expect(jsonMock).toHaveBeenCalledWith({
          success: false,
          error: {
            code: 'TEST_ERROR',
            message: 'Test message',
            requestId: 'test-request-id',
          },
        });
      });
    });

    describe('ZodError handling', () => {
      it('should handle ZodError and map to ValidationError format', () => {
        const schema = z.object({
          email: z.string().email(),
          password: z.string().min(8),
        });

        let zodError: z.ZodError | null = null;
        try {
          schema.parse({ email: 'invalid', password: 'short' });
        } catch (err) {
          zodError = err as z.ZodError;
        }

        expect(zodError).not.toBeNull();
        errorHandler(zodError!, mockReq, mockRes, mockNext);

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: expect.arrayContaining([
              expect.objectContaining({ field: 'email' }) as unknown,
              expect.objectContaining({ field: 'password' }) as unknown,
            ]) as unknown,
            requestId: 'test-request-id',
          },
        });
      });

      it('should handle nested field paths in ZodError', () => {
        const schema = z.object({
          user: z.object({
            profile: z.object({
              name: z.string(),
            }),
          }),
        });

        let zodError: z.ZodError | null = null;
        try {
          schema.parse({ user: { profile: {} } });
        } catch (err) {
          zodError = err as z.ZodError;
        }

        expect(zodError).not.toBeNull();
        errorHandler(zodError!, mockReq, mockRes, mockNext);

        expect(jsonMock).toHaveBeenCalledWith({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: [expect.objectContaining({ field: 'user.profile.name' })],
            requestId: 'test-request-id',
          },
        });
      });
    });

    describe('Unknown error handling', () => {
      it('should return generic 500 error for unknown errors', () => {
        const error = new Error('Something went wrong');

        errorHandler(error, mockReq, mockRes, mockNext);

        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error',
            requestId: 'test-request-id',
          },
        });
      });

      it('should not expose stack trace to client', () => {
        const error = new Error('Database connection failed');
        error.stack = 'Error: Database connection failed\n    at Connection.connect...';

        errorHandler(error, mockReq, mockRes, mockNext);

        const calls = jsonMock.mock.calls as Array<[ApiErrorResponse]>;
        const response = calls[0][0];
        expect((response.error as Record<string, unknown>).stack).toBeUndefined();
        expect(response.error.message).toBe('Internal server error');
      });
    });

    describe('Request ID handling', () => {
      it('should include requestId when available', () => {
        const error = new Error('Test');
        mockReq.id = 'custom-req-id';

        errorHandler(error, mockReq, mockRes, mockNext);

        expect(jsonMock).toHaveBeenCalledWith(
          expect.objectContaining({
            error: expect.objectContaining({
              requestId: 'custom-req-id',
            }) as Record<string, unknown>,
          }),
        );
      });

      it('should not include requestId when not available', () => {
        const error = new Error('Test');
        delete (mockReq as { id?: string }).id;

        errorHandler(error, mockReq, mockRes, mockNext);

        const calls = jsonMock.mock.calls as Array<[ApiErrorResponse]>;
        const response = calls[0][0];
        expect(response.error.requestId).toBeUndefined();
      });
    });

    describe('logging', () => {
      it('should log 500 errors', () => {
        const error = new Error('Internal error');

        errorHandler(error, mockReq, mockRes, mockNext);

        expect(statusMock).toHaveBeenCalledWith(500);
      });
    });
  });

  describe('notFoundHandler', () => {
    it('should return 404 with method and path', () => {
      const req = {
        ...mockReq,
        method: 'POST',
        path: '/api/unknown',
      };

      notFoundHandler(req as Request, mockRes);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Cannot POST /api/unknown',
          requestId: 'test-request-id',
        },
      });
    });

    it('should include requestId when available', () => {
      const req = {
        id: 'not-found-req-id',
        method: 'GET',
        path: '/api/missing',
      };

      notFoundHandler(req as Request, mockRes);

      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Cannot GET /api/missing',
          requestId: 'not-found-req-id',
        },
      });
    });
  });

  describe('asyncHandler', () => {
    it('should call the wrapped function normally', async () => {
      const mockFn = jest.fn().mockResolvedValue(undefined);
      const handler = asyncHandler(mockFn);

      await Promise.resolve(handler(mockReq, mockRes, mockNext));

      expect(mockFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
    });

    it('should catch rejected promises and pass to next', async () => {
      const error = new Error('Async error');
      const mockFn = jest.fn().mockRejectedValue(error);
      const handler = asyncHandler(mockFn);

      await Promise.resolve(handler(mockReq, mockRes, mockNext));

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should catch thrown errors and pass to next', async () => {
      const error = new Error('Thrown error');
      const mockFn = jest.fn().mockImplementation(() => {
        return Promise.reject(error);
      });
      const handler = asyncHandler(mockFn);

      await Promise.resolve(handler(mockReq, mockRes, mockNext));

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should catch AppError and pass to next', async () => {
      const error = AppError.notFound('Resource');
      const mockFn = jest.fn().mockRejectedValue(error);
      const handler = asyncHandler(mockFn);

      await Promise.resolve(handler(mockReq, mockRes, mockNext));

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
