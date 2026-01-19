import { createErrorResponse, createSuccessResponse, isValidEmail, UserRole } from './types';

describe('types', () => {
  describe('UserRole', () => {
    it('should have ADMIN role', () => {
      expect(UserRole.ADMIN).toBe('ADMIN');
    });

    it('should have TEACHER role', () => {
      expect(UserRole.TEACHER).toBe('TEACHER');
    });

    it('should have STUDENT role', () => {
      expect(UserRole.STUDENT).toBe('STUDENT');
    });
  });

  describe('isValidEmail', () => {
    it('should return true for valid email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
    });

    it('should return true for email with subdomain', () => {
      expect(isValidEmail('user@mail.example.com')).toBe(true);
    });

    it('should return true for email with numbers', () => {
      expect(isValidEmail('user123@example123.com')).toBe(true);
    });

    it('should return true for email with plus sign', () => {
      expect(isValidEmail('user+tag@example.com')).toBe(true);
    });

    it('should return false for email without @', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
    });

    it('should return false for email without domain', () => {
      expect(isValidEmail('test@')).toBe(false);
    });

    it('should return false for email with spaces', () => {
      expect(isValidEmail('test @example.com')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidEmail('')).toBe(false);
    });

    it('should return false for email with consecutive dots in domain', () => {
      expect(isValidEmail('test@example..com')).toBe(false);
    });

    it('should return false for email with single char TLD', () => {
      expect(isValidEmail('test@example.c')).toBe(false);
    });

    it('should return false for email starting with dot', () => {
      expect(isValidEmail('.test@example.com')).toBe(false);
    });

    it('should return false for email with only special chars', () => {
      expect(isValidEmail('@@@.@@')).toBe(false);
    });
  });

  describe('createSuccessResponse', () => {
    it('should create success response with data', () => {
      const data = { id: '1', name: 'Test' };
      const response = createSuccessResponse(data);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.error).toBeUndefined();
    });

    it('should work with array data', () => {
      const data = [1, 2, 3];
      const response = createSuccessResponse(data);

      expect(response.success).toBe(true);
      expect(response.data).toEqual([1, 2, 3]);
    });

    it('should work with null data', () => {
      const response = createSuccessResponse(null);

      expect(response.success).toBe(true);
      expect(response.data).toBeNull();
    });
  });

  describe('createErrorResponse', () => {
    it('should create error response with code and message', () => {
      const response = createErrorResponse('NOT_FOUND', 'Resource not found');

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('NOT_FOUND');
      expect(response.error?.message).toBe('Resource not found');
      expect(response.data).toBeUndefined();
    });

    it('should handle validation error', () => {
      const response = createErrorResponse('VALIDATION_ERROR', 'Invalid input');

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('VALIDATION_ERROR');
    });
  });
});
