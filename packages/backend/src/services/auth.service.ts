import { prisma } from '../lib/prisma';
import { storeRefreshToken, validateRefreshToken, deleteRefreshToken } from '../lib/redis';
import { generateTokenPair, verifyToken, TokenPair, JwtPayload } from '../utils/jwt';
import { comparePassword } from '../utils/password';

export interface LoginResult {
  tokens: TokenPair;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface AuthError {
  code: string;
  message: string;
}

export class AuthService {
  async login(email: string, password: string): Promise<LoginResult> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      } as AuthError;
    }

    const isValidPassword = await comparePassword(password, user.passwordHash);

    if (!isValidPassword) {
      throw {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      } as AuthError;
    }

    const payload: JwtPayload = {
      userId: user.id,
      role: user.role,
    };

    const tokens = generateTokenPair(payload);

    // Store refresh token in Redis
    await storeRefreshToken(user.id, tokens.refreshToken);

    return {
      tokens,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    let payload: JwtPayload;

    try {
      payload = verifyToken(refreshToken);
    } catch {
      throw {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired refresh token',
      } as AuthError;
    }

    // Validate refresh token against stored token
    const isValid = await validateRefreshToken(payload.userId, refreshToken);

    if (!isValid) {
      throw {
        code: 'INVALID_TOKEN',
        message: 'Refresh token has been revoked',
      } as AuthError;
    }

    // Get fresh user data
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw {
        code: 'USER_NOT_FOUND',
        message: 'User no longer exists',
      } as AuthError;
    }

    // Generate new token pair (token rotation)
    const newPayload: JwtPayload = {
      userId: user.id,
      role: user.role,
    };

    const tokens = generateTokenPair(newPayload);

    // Store new refresh token (replaces old one)
    await storeRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await deleteRefreshToken(userId);
  }

  validateAccessToken(token: string): JwtPayload {
    try {
      return verifyToken(token);
    } catch {
      throw {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired access token',
      } as AuthError;
    }
  }
}

export const authService = new AuthService();
