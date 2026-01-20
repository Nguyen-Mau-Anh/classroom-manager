import { Request, Response, NextFunction } from 'express';

import { authService } from '../services/auth.service';

import { authenticate, authorize } from './auth.middleware';

// Mock auth service
jest.mock('../services/auth.service', () => ({
  authService: {
    validateAccessToken: jest.fn(),
  },
}));

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should return 401 if no authorization header is provided', () => {
      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'No authorization header provided',
        },
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if authorization header is not Bearer format', () => {
      mockRequest.headers = { authorization: 'Basic some-token' };

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid authorization header format. Use: Bearer <token>',
        },
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid token', () => {
      mockRequest.headers = { authorization: 'Bearer invalid-token' };
      (authService.validateAccessToken as jest.Mock).mockImplementation(() => {
        throw {
          code: 'INVALID_TOKEN',
          message: 'Invalid token',
        };
      });

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next and attach user for valid token', () => {
      const userPayload = { userId: 'user-123', role: 'ADMIN' };
      mockRequest.headers = { authorization: 'Bearer valid-token' };
      (authService.validateAccessToken as jest.Mock).mockReturnValue(userPayload);

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRequest.user).toEqual(userPayload);
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('authorize', () => {
    it('should return 401 if user is not attached to request', () => {
      const middleware = authorize('ADMIN');

      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 403 if user role is not in allowed roles', () => {
      mockRequest.user = { userId: 'user-123', role: 'STUDENT' };
      const middleware = authorize('ADMIN');

      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        },
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next if user role is in allowed roles', () => {
      mockRequest.user = { userId: 'user-123', role: 'ADMIN' };
      const middleware = authorize('ADMIN', 'TEACHER');

      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should support multiple allowed roles', () => {
      mockRequest.user = { userId: 'user-123', role: 'TEACHER' };
      const middleware = authorize('ADMIN', 'TEACHER');

      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });
  });
});
