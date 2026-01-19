/**
 * User roles in the classroom management system.
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
}

/**
 * Base user interface.
 */
export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * API response wrapper type.
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown[];
  };
}

/**
 * Validates if a string is a valid email format.
 * Uses a robust regex that checks for:
 * - Valid local part (letters, numbers, and allowed special chars)
 * - Single @ symbol
 * - Valid domain with no consecutive dots
 * - TLD of at least 2 characters
 */
export function isValidEmail(email: string): boolean {
  // More robust email regex:
  // - Local part: alphanumeric and special chars (._%+-), no consecutive dots
  // - Domain: alphanumeric and hyphens, no consecutive dots
  // - TLD: at least 2 letters
  const emailRegex =
    /^[a-zA-Z0-9](?:[a-zA-Z0-9._%+-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Creates a successful API response.
 */
export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Creates an error API response.
 */
export function createErrorResponse(code: string, message: string): ApiResponse<never> {
  return {
    success: false,
    error: {
      code,
      message,
    },
  };
}
