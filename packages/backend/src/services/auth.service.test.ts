import { prisma } from '../lib/prisma';
import * as redisModule from '../lib/redis';
import * as jwtModule from '../utils/jwt';
import * as passwordModule from '../utils/password';

import { AuthService, AuthError } from './auth.service';

// Mock dependencies
jest.mock('../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('../lib/redis', () => ({
  storeRefreshToken: jest.fn(),
  validateRefreshToken: jest.fn(),
  deleteRefreshToken: jest.fn(),
}));

jest.mock('../utils/password', () => ({
  comparePassword: jest.fn(),
}));

jest.mock('../utils/jwt', () => ({
  generateTokenPair: jest.fn(),
  verifyToken: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    passwordHash: 'hashedPassword',
    role: 'ADMIN',
  };

  const mockTokens = {
    accessToken: 'access-token-123',
    refreshToken: 'refresh-token-123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (passwordModule.comparePassword as jest.Mock).mockResolvedValue(true);
      (jwtModule.generateTokenPair as jest.Mock).mockReturnValue(mockTokens);
      (redisModule.storeRefreshToken as jest.Mock).mockResolvedValue(undefined);

      const result = await authService.login('test@example.com', 'password123');

      expect(result.tokens).toEqual(mockTokens);
      expect(result.user.id).toBe(mockUser.id);
      expect(result.user.email).toBe(mockUser.email);
      expect(result.user.role).toBe(mockUser.role);
      expect(redisModule.storeRefreshToken).toHaveBeenCalledWith(
        mockUser.id,
        mockTokens.refreshToken
      );
    });

    it('should throw error for non-existent user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.login('nonexistent@example.com', 'password123')
      ).rejects.toMatchObject({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      } as AuthError);
    });

    it('should throw error for invalid password', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (passwordModule.comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(authService.login('test@example.com', 'wrongpassword')).rejects.toMatchObject({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      } as AuthError);
    });
  });

  describe('refresh', () => {
    it('should successfully refresh tokens with valid refresh token', async () => {
      const newTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      (jwtModule.verifyToken as jest.Mock).mockReturnValue({
        userId: mockUser.id,
        role: mockUser.role,
      });
      (redisModule.validateRefreshToken as jest.Mock).mockResolvedValue(true);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (jwtModule.generateTokenPair as jest.Mock).mockReturnValue(newTokens);
      (redisModule.storeRefreshToken as jest.Mock).mockResolvedValue(undefined);

      const result = await authService.refresh('valid-refresh-token');

      expect(result).toEqual(newTokens);
      expect(redisModule.storeRefreshToken).toHaveBeenCalledWith(
        mockUser.id,
        newTokens.refreshToken
      );
    });

    it('should throw error for invalid refresh token', async () => {
      (jwtModule.verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.refresh('invalid-token')).rejects.toMatchObject({
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired refresh token',
      } as AuthError);
    });

    it('should throw error for revoked refresh token', async () => {
      (jwtModule.verifyToken as jest.Mock).mockReturnValue({
        userId: mockUser.id,
        role: mockUser.role,
      });
      (redisModule.validateRefreshToken as jest.Mock).mockResolvedValue(false);

      await expect(authService.refresh('revoked-token')).rejects.toMatchObject({
        code: 'INVALID_TOKEN',
        message: 'Refresh token has been revoked',
      } as AuthError);
    });

    it('should throw error if user no longer exists', async () => {
      (jwtModule.verifyToken as jest.Mock).mockReturnValue({
        userId: mockUser.id,
        role: mockUser.role,
      });
      (redisModule.validateRefreshToken as jest.Mock).mockResolvedValue(true);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(authService.refresh('valid-token')).rejects.toMatchObject({
        code: 'USER_NOT_FOUND',
        message: 'User no longer exists',
      } as AuthError);
    });
  });

  describe('logout', () => {
    it('should delete refresh token on logout', async () => {
      (redisModule.deleteRefreshToken as jest.Mock).mockResolvedValue(undefined);

      await authService.logout('user-123');

      expect(redisModule.deleteRefreshToken).toHaveBeenCalledWith('user-123');
    });
  });

  describe('validateAccessToken', () => {
    it('should return payload for valid access token', () => {
      const expectedPayload = { userId: 'user-123', role: 'ADMIN' };
      (jwtModule.verifyToken as jest.Mock).mockReturnValue(expectedPayload);

      const result = authService.validateAccessToken('valid-token');

      expect(result).toEqual(expectedPayload);
    });

    it('should throw error for invalid access token', () => {
      (jwtModule.verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => authService.validateAccessToken('invalid-token')).toThrow();
    });
  });
});
