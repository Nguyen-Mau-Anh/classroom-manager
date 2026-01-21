import { ErrorCode } from '../types/api';

import { AppError } from './app-error';

describe('AppError', () => {
  describe('constructor', () => {
    it('should create an error with all properties', () => {
      const details = [{ field: 'email', message: 'Invalid email' }];
      const error = new AppError('TEST_ERROR', 'Test message', 400, details);

      expect(error.code).toBe('TEST_ERROR');
      expect(error.message).toBe('Test message');
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual(details);
      expect(error.name).toBe('AppError');
    });

    it('should default statusCode to 500', () => {
      const error = new AppError('ERROR', 'Message');

      expect(error.statusCode).toBe(500);
    });

    it('should be an instance of Error', () => {
      const error = new AppError('ERROR', 'Message');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    });

    it('should have proper prototype chain for instanceof', () => {
      const error = new AppError('ERROR', 'Message');

      expect(error instanceof AppError).toBe(true);
      expect(Object.getPrototypeOf(error)).toBe(AppError.prototype);
    });
  });

  describe('static validation', () => {
    it('should create a validation error with details', () => {
      const details = [
        { field: 'email', message: 'Invalid email format' },
        { field: 'password', message: 'Password too short' },
      ];
      const error = AppError.validation('Validation failed', details);

      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual(details);
    });
  });

  describe('static notFound', () => {
    it('should create a not found error with resource name', () => {
      const error = AppError.notFound('User');

      expect(error.code).toBe(ErrorCode.NOT_FOUND);
      expect(error.message).toBe('User not found');
      expect(error.statusCode).toBe(404);
      expect(error.details).toBeUndefined();
    });

    it('should work with different resource names', () => {
      const error = AppError.notFound('Classroom');

      expect(error.message).toBe('Classroom not found');
    });
  });

  describe('static unauthorized', () => {
    it('should create an unauthorized error with default message', () => {
      const error = AppError.unauthorized();

      expect(error.code).toBe(ErrorCode.UNAUTHORIZED);
      expect(error.message).toBe('Unauthorized');
      expect(error.statusCode).toBe(401);
    });

    it('should create an unauthorized error with custom message', () => {
      const error = AppError.unauthorized('Invalid token');

      expect(error.message).toBe('Invalid token');
    });
  });

  describe('static forbidden', () => {
    it('should create a forbidden error with default message', () => {
      const error = AppError.forbidden();

      expect(error.code).toBe(ErrorCode.FORBIDDEN);
      expect(error.message).toBe('Forbidden');
      expect(error.statusCode).toBe(403);
    });

    it('should create a forbidden error with custom message', () => {
      const error = AppError.forbidden('Admin access required');

      expect(error.message).toBe('Admin access required');
    });
  });

  describe('static conflict', () => {
    it('should create a conflict error', () => {
      const error = AppError.conflict('Email already exists');

      expect(error.code).toBe(ErrorCode.CONFLICT);
      expect(error.message).toBe('Email already exists');
      expect(error.statusCode).toBe(409);
    });
  });

  describe('static internal', () => {
    it('should create an internal error with default message', () => {
      const error = AppError.internal();

      expect(error.code).toBe(ErrorCode.INTERNAL_ERROR);
      expect(error.message).toBe('Internal server error');
      expect(error.statusCode).toBe(500);
    });

    it('should create an internal error with custom message', () => {
      const error = AppError.internal('Database connection failed');

      expect(error.message).toBe('Database connection failed');
    });
  });

  describe('static invalidCredentials', () => {
    it('should create an invalid credentials error with default message', () => {
      const error = AppError.invalidCredentials();

      expect(error.code).toBe(ErrorCode.INVALID_CREDENTIALS);
      expect(error.message).toBe('Invalid credentials');
      expect(error.statusCode).toBe(401);
    });

    it('should create an invalid credentials error with custom message', () => {
      const error = AppError.invalidCredentials('Email or password is incorrect');

      expect(error.message).toBe('Email or password is incorrect');
    });
  });

  describe('static tokenExpired', () => {
    it('should create a token expired error with default message', () => {
      const error = AppError.tokenExpired();

      expect(error.code).toBe(ErrorCode.TOKEN_EXPIRED);
      expect(error.message).toBe('Token has expired');
      expect(error.statusCode).toBe(401);
    });

    it('should create a token expired error with custom message', () => {
      const error = AppError.tokenExpired('Access token has expired');

      expect(error.message).toBe('Access token has expired');
    });
  });
});
