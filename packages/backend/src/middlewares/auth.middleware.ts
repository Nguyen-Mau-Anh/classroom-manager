import { Request, Response, NextFunction } from 'express';

import { AppError } from '../errors/app-error';
import { authService, AuthError } from '../services/auth.service';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw AppError.unauthorized('No authorization header provided');
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw AppError.unauthorized('Invalid authorization header format. Use: Bearer <token>');
  }

  const token = parts[1];

  try {
    const payload = authService.validateAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    const authError = error as AuthError;
    if (authError.code === 'TOKEN_EXPIRED') {
      throw AppError.tokenExpired(authError.message);
    }
    throw AppError.unauthorized(authError.message || 'Invalid or expired token');
  }
}

export function authorize(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw AppError.forbidden('Insufficient permissions');
    }

    next();
  };
}
