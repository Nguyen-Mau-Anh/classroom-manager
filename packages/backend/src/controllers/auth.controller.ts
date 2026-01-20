import { Request, Response } from 'express';

import { authService, AuthError } from '../services/auth.service';

interface LoginBody {
  email?: string;
  password?: string;
}

interface RefreshBody {
  refreshToken?: string;
}

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body as LoginBody;
      const { email, password } = body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email and password are required',
          },
        });
        return;
      }

      const result = await authService.login(email, password);

      res.status(200).json({
        success: true,
        data: {
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken,
          user: result.user,
        },
      });
    } catch (error) {
      const authError = error as AuthError;
      const statusCode = authError.code === 'INVALID_CREDENTIALS' ? 401 : 500;

      res.status(statusCode).json({
        success: false,
        error: {
          code: authError.code || 'INTERNAL_ERROR',
          message: authError.message || 'An unexpected error occurred',
        },
      });
    }
  }

  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body as RefreshBody;
      const { refreshToken } = body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Refresh token is required',
          },
        });
        return;
      }

      const tokens = await authService.refresh(refreshToken);

      res.status(200).json({
        success: true,
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      });
    } catch (error) {
      const authError = error as AuthError;
      const statusCode = authError.code === 'INVALID_TOKEN' ? 401 : 500;

      res.status(statusCode).json({
        success: false,
        error: {
          code: authError.code || 'INTERNAL_ERROR',
          message: authError.message || 'An unexpected error occurred',
        },
      });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
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

      await authService.logout(req.user.userId);

      res.status(200).json({
        success: true,
        data: {
          message: 'Logged out successfully',
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred during logout',
        },
      });
    }
  }

  me(req: Request, res: Response): void {
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

    res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  }
}

export const authController = new AuthController();
