import { Request, Response, NextFunction } from 'express';

import { AppError } from '../errors/app-error';
import { authService } from '../services/auth.service';

import { authenticate, authorize } from './auth.middleware';

// Mock auth service
jest.mock('../services/auth.service', () => ({
  authService: {
    validateAccessToken: jest.fn(),
  },
}));

describe('Auth Middleware', () => {
  let mockRequest: Request;
  let mockResponse: Response;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    } as Request;
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should throw AppError.unauthorized if no authorization header is provided', () => {
      expect(() => {
        authenticate(mockRequest, mockResponse, nextFunction);
      }).toThrow(AppError);

      try {
        authenticate(mockRequest, mockResponse, nextFunction);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        const appError = error as AppError;
        expect(appError.code).toBe('UNAUTHORIZED');
        expect(appError.statusCode).toBe(401);
        expect(appError.message).toBe('No authorization header provided');
      }

      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should throw AppError.unauthorized if authorization header is not Bearer format', () => {
      mockRequest.headers = { authorization: 'Basic some-token' };

      expect(() => {
        authenticate(mockRequest, mockResponse, nextFunction);
      }).toThrow(AppError);

      try {
        authenticate(mockRequest, mockResponse, nextFunction);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        const appError = error as AppError;
        expect(appError.code).toBe('UNAUTHORIZED');
        expect(appError.message).toBe('Invalid authorization header format. Use: Bearer <token>');
      }

      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should throw AppError.unauthorized for invalid token', () => {
      mockRequest.headers = { authorization: 'Bearer invalid-token' };
      (authService.validateAccessToken as jest.Mock).mockImplementation(() => {
        throw {
          code: 'INVALID_TOKEN',
          message: 'Invalid token',
        };
      });

      expect(() => {
        authenticate(mockRequest, mockResponse, nextFunction);
      }).toThrow(AppError);

      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should throw AppError.tokenExpired for expired token', () => {
      mockRequest.headers = { authorization: 'Bearer expired-token' };
      (authService.validateAccessToken as jest.Mock).mockImplementation(() => {
        throw {
          code: 'TOKEN_EXPIRED',
          message: 'Token has expired',
        };
      });

      try {
        authenticate(mockRequest, mockResponse, nextFunction);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        const appError = error as AppError;
        expect(appError.code).toBe('TOKEN_EXPIRED');
        expect(appError.statusCode).toBe(401);
      }

      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next and attach user for valid token', () => {
      const userPayload = { userId: 'user-123', role: 'ADMIN' };
      mockRequest.headers = { authorization: 'Bearer valid-token' };
      (authService.validateAccessToken as jest.Mock).mockReturnValue(userPayload);

      authenticate(mockRequest, mockResponse, nextFunction);

      expect(mockRequest.user).toEqual(userPayload);
      expect(nextFunction).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('authorize', () => {
    it('should throw AppError.unauthorized if user is not attached to request', () => {
      const middleware = authorize('ADMIN');

      expect(() => {
        middleware(mockRequest, mockResponse, nextFunction);
      }).toThrow(AppError);

      try {
        middleware(mockRequest, mockResponse, nextFunction);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        const appError = error as AppError;
        expect(appError.code).toBe('UNAUTHORIZED');
        expect(appError.message).toBe('Authentication required');
      }

      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should throw AppError.forbidden if user role is not in allowed roles', () => {
      mockRequest.user = { userId: 'user-123', role: 'STUDENT' };
      const middleware = authorize('ADMIN');

      expect(() => {
        middleware(mockRequest, mockResponse, nextFunction);
      }).toThrow(AppError);

      try {
        middleware(mockRequest, mockResponse, nextFunction);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        const appError = error as AppError;
        expect(appError.code).toBe('FORBIDDEN');
        expect(appError.statusCode).toBe(403);
        expect(appError.message).toBe('Insufficient permissions');
      }

      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next if user role is in allowed roles', () => {
      mockRequest.user = { userId: 'user-123', role: 'ADMIN' };
      const middleware = authorize('ADMIN', 'TEACHER');

      middleware(mockRequest, mockResponse, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should support multiple allowed roles', () => {
      mockRequest.user = { userId: 'user-123', role: 'TEACHER' };
      const middleware = authorize('ADMIN', 'TEACHER');

      middleware(mockRequest, mockResponse, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });
  });
});
