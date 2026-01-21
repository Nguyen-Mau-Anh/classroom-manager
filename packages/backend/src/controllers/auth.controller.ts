import { Request, Response } from 'express';

import { AppError } from '../errors/app-error';
import { authService, AuthError } from '../services/auth.service';
import { success } from '../utils/api-response';

interface LoginBody {
  email?: string;
  password?: string;
}

interface RefreshBody {
  refreshToken?: string;
}

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    const body = req.body as LoginBody;
    const { email, password } = body;

    if (!email || !password) {
      throw AppError.validation('Email and password are required', [
        ...(!email ? [{ field: 'email', message: 'Email is required' }] : []),
        ...(!password ? [{ field: 'password', message: 'Password is required' }] : []),
      ]);
    }

    try {
      const result = await authService.login(email, password);

      success(res, {
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        user: result.user,
      });
    } catch (error) {
      const authError = error as AuthError;
      if (authError.code === 'INVALID_CREDENTIALS') {
        throw AppError.invalidCredentials(authError.message);
      }
      throw error;
    }
  }

  async refresh(req: Request, res: Response): Promise<void> {
    const body = req.body as RefreshBody;
    const { refreshToken } = body;

    if (!refreshToken) {
      throw AppError.validation('Refresh token is required', [
        { field: 'refreshToken', message: 'Refresh token is required' },
      ]);
    }

    try {
      const tokens = await authService.refresh(refreshToken);

      success(res, {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error) {
      const authError = error as AuthError;
      if (authError.code === 'INVALID_TOKEN') {
        throw AppError.unauthorized(authError.message);
      }
      if (authError.code === 'TOKEN_EXPIRED') {
        throw AppError.tokenExpired(authError.message);
      }
      throw error;
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required');
    }

    await authService.logout(req.user.userId);

    success(res, {
      message: 'Logged out successfully',
    });
  }

  me(req: Request, res: Response): void {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required');
    }

    success(res, {
      user: req.user,
    });
  }
}

export const authController = new AuthController();
