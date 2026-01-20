import { Request, Response, NextFunction } from 'express';

import { authService, AuthError } from '../services/auth.service';

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'No authorization header provided',
      },
    });
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid authorization header format. Use: Bearer <token>',
      },
    });
    return;
  }

  const token = parts[1];

  try {
    const payload = authService.validateAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    const authError = error as AuthError;
    res.status(401).json({
      success: false,
      error: {
        code: authError.code || 'UNAUTHORIZED',
        message: authError.message || 'Invalid or expired token',
      },
    });
  }
}

export function authorize(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        },
      });
      return;
    }

    next();
  };
}
