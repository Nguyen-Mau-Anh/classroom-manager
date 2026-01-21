import { Response } from 'express';

import {
  success,
  error,
  validationError,
  notFoundError,
  unauthorizedError,
  forbiddenError,
  internalError,
  apiResponse,
} from './api-response';

describe('api-response', () => {
  let mockRes: Response;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn().mockReturnThis();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockRes = {
      status: statusMock,
      json: jsonMock,
    } as unknown as Response;
  });

  describe('success', () => {
    it('should return success response with data and default 200 status', () => {
      const data = { id: 1, name: 'Test' };
      success(mockRes, data);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: { id: 1, name: 'Test' },
      });
    });

    it('should return success response with custom status code', () => {
      const data = { id: 1 };
      success(mockRes, data, 201);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: { id: 1 },
      });
    });

    it('should handle null data', () => {
      success(mockRes, null);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: null,
      });
    });

    it('should handle array data', () => {
      const data = [{ id: 1 }, { id: 2 }];
      success(mockRes, data);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: [{ id: 1 }, { id: 2 }],
      });
    });
  });

  describe('error', () => {
    it('should return error response with code and message', () => {
      error(mockRes, 'TEST_ERROR', 'Test error message', 400);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'TEST_ERROR',
          message: 'Test error message',
        },
      });
    });

    it('should include details when provided', () => {
      const details = [{ field: 'email', message: 'Invalid email format' }];
      error(mockRes, 'VALIDATION_ERROR', 'Validation failed', 400, details);

      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: [{ field: 'email', message: 'Invalid email format' }],
        },
      });
    });

    it('should include requestId when provided', () => {
      error(mockRes, 'TEST_ERROR', 'Test message', 500, undefined, 'req-123');

      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'TEST_ERROR',
          message: 'Test message',
          requestId: 'req-123',
        },
      });
    });

    it('should not include empty details array', () => {
      error(mockRes, 'TEST_ERROR', 'Test message', 400, []);

      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'TEST_ERROR',
          message: 'Test message',
        },
      });
    });

    it('should default to 500 status code', () => {
      error(mockRes, 'INTERNAL_ERROR', 'Server error');

      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });

  describe('validationError', () => {
    it('should return validation error with details', () => {
      const details = [
        { field: 'email', message: 'Invalid email' },
        { field: 'password', message: 'Password too short' },
      ];
      validationError(mockRes, 'Validation failed', details);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details,
        },
      });
    });

    it('should include requestId when provided', () => {
      const details = [{ field: 'email', message: 'Required' }];
      validationError(mockRes, 'Validation failed', details, 'req-456');

      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details,
          requestId: 'req-456',
        },
      });
    });
  });

  describe('notFoundError', () => {
    it('should return not found error with resource name', () => {
      notFoundError(mockRes, 'User');

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
        },
      });
    });

    it('should include requestId when provided', () => {
      notFoundError(mockRes, 'User', 'req-789');

      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
          requestId: 'req-789',
        },
      });
    });
  });

  describe('unauthorizedError', () => {
    it('should return unauthorized error with default message', () => {
      unauthorizedError(mockRes);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Unauthorized',
        },
      });
    });

    it('should return unauthorized error with custom message', () => {
      unauthorizedError(mockRes, 'Token expired');

      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Token expired',
        },
      });
    });
  });

  describe('forbiddenError', () => {
    it('should return forbidden error with default message', () => {
      forbiddenError(mockRes);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Forbidden',
        },
      });
    });

    it('should return forbidden error with custom message', () => {
      forbiddenError(mockRes, 'Insufficient permissions');

      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        },
      });
    });
  });

  describe('internalError', () => {
    it('should return internal error with default message', () => {
      internalError(mockRes);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      });
    });

    it('should return internal error with custom message', () => {
      internalError(mockRes, 'Database connection failed');

      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Database connection failed',
        },
      });
    });
  });

  describe('apiResponse object', () => {
    it('should export all response helpers', () => {
      expect(apiResponse.success).toBe(success);
      expect(apiResponse.error).toBe(error);
      expect(apiResponse.validationError).toBe(validationError);
      expect(apiResponse.notFoundError).toBe(notFoundError);
      expect(apiResponse.unauthorizedError).toBe(unauthorizedError);
      expect(apiResponse.forbiddenError).toBe(forbiddenError);
      expect(apiResponse.internalError).toBe(internalError);
    });
  });
});
