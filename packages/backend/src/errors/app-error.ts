import { ErrorCode, ValidationDetail } from '../types/api';

/**
 * Custom application error class for consistent error handling.
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: ValidationDetail[];

  constructor(
    code: string,
    message: string,
    statusCode: number = 500,
    details?: ValidationDetail[],
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    // Ensures proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }

  /**
   * Creates a validation error with field-level details.
   */
  static validation(message: string, details: ValidationDetail[]): AppError {
    return new AppError(ErrorCode.VALIDATION_ERROR, message, 400, details);
  }

  /**
   * Creates a not found error.
   */
  static notFound(resource: string): AppError {
    return new AppError(ErrorCode.NOT_FOUND, `${resource} not found`, 404);
  }

  /**
   * Creates an unauthorized error.
   */
  static unauthorized(message = 'Unauthorized'): AppError {
    return new AppError(ErrorCode.UNAUTHORIZED, message, 401);
  }

  /**
   * Creates a forbidden error.
   */
  static forbidden(message = 'Forbidden'): AppError {
    return new AppError(ErrorCode.FORBIDDEN, message, 403);
  }

  /**
   * Creates a conflict error.
   */
  static conflict(message: string): AppError {
    return new AppError(ErrorCode.CONFLICT, message, 409);
  }

  /**
   * Creates an internal server error.
   */
  static internal(message = 'Internal server error'): AppError {
    return new AppError(ErrorCode.INTERNAL_ERROR, message, 500);
  }

  /**
   * Creates an invalid credentials error.
   */
  static invalidCredentials(message = 'Invalid credentials'): AppError {
    return new AppError(ErrorCode.INVALID_CREDENTIALS, message, 401);
  }

  /**
   * Creates a token expired error.
   */
  static tokenExpired(message = 'Token has expired'): AppError {
    return new AppError(ErrorCode.TOKEN_EXPIRED, message, 401);
  }
}
