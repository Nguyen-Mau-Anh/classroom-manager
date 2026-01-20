import request from 'supertest';

import { prisma } from '../lib/prisma';
import * as redisModule from '../lib/redis';
import { app } from '../server';
import { generateTokenPair, JwtPayload } from '../utils/jwt';
import { hashPassword } from '../utils/password';

interface UserData {
  id?: string;
  userId?: string;
  email?: string;
  role?: string;
}

interface ApiResponse {
  success: boolean;
  data?: {
    accessToken?: string;
    refreshToken?: string;
    user?: UserData;
    message?: string;
  };
  error?: {
    code?: string;
    message?: string;
  };
}

// Mock Redis for integration tests
jest.mock('../lib/redis', () => ({
  redis: {
    on: jest.fn(),
    quit: jest.fn(),
    status: 'ready',
  },
  storeRefreshToken: jest.fn().mockResolvedValue(undefined),
  getRefreshToken: jest.fn(),
  deleteRefreshToken: jest.fn().mockResolvedValue(undefined),
  validateRefreshToken: jest.fn(),
}));

// Mock Prisma
jest.mock('../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

describe('Auth Routes Integration Tests', () => {
  const testUser = {
    id: 'user-123',
    email: 'test@example.com',
    passwordHash: '',
    role: 'ADMIN',
  };

  beforeAll(async () => {
    // Hash the test password
    testUser.passwordHash = await hashPassword('password123');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should return tokens for valid credentials', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(testUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect((response.body as ApiResponse).success).toBe(true);
      expect((response.body as ApiResponse).data!.accessToken).toBeDefined();
      expect((response.body as ApiResponse).data!.refreshToken).toBeDefined();
      expect((response.body as ApiResponse).data!.user!.id).toBe(testUser.id);
      expect((response.body as ApiResponse).data!.user!.email).toBe(testUser.email);
      expect((response.body as ApiResponse).data!.user!.role).toBe(testUser.role);
      expect(redisModule.storeRefreshToken).toHaveBeenCalled();
    });

    it('should return 401 for invalid password', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(testUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect((response.body as ApiResponse).success).toBe(false);
      expect((response.body as ApiResponse).error!.code).toBe('INVALID_CREDENTIALS');
    });

    it('should return 401 for non-existent user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'password123' });

      expect(response.status).toBe(401);
      expect((response.body as ApiResponse).success).toBe(false);
      expect((response.body as ApiResponse).error!.code).toBe('INVALID_CREDENTIALS');
    });

    it('should return 400 if email is missing', async () => {
      const response = await request(app).post('/api/auth/login').send({ password: 'password123' });

      expect(response.status).toBe(400);
      expect((response.body as ApiResponse).success).toBe(false);
      expect((response.body as ApiResponse).error!.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 if password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect((response.body as ApiResponse).success).toBe(false);
      expect((response.body as ApiResponse).error!.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should return new tokens for valid refresh token', async () => {
      const payload: JwtPayload = { userId: testUser.id, role: testUser.role };
      const tokens = generateTokenPair(payload);

      (redisModule.validateRefreshToken as jest.Mock).mockResolvedValue(true);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(testUser);

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: tokens.refreshToken });

      expect(response.status).toBe(200);
      expect((response.body as ApiResponse).success).toBe(true);
      expect((response.body as ApiResponse).data!.accessToken).toBeDefined();
      expect((response.body as ApiResponse).data!.refreshToken).toBeDefined();
    });

    it('should return 401 for invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(response.status).toBe(401);
      expect((response.body as ApiResponse).success).toBe(false);
      expect((response.body as ApiResponse).error!.code).toBe('INVALID_TOKEN');
    });

    it('should return 401 for revoked refresh token', async () => {
      const payload: JwtPayload = { userId: testUser.id, role: testUser.role };
      const tokens = generateTokenPair(payload);

      (redisModule.validateRefreshToken as jest.Mock).mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: tokens.refreshToken });

      expect(response.status).toBe(401);
      expect((response.body as ApiResponse).success).toBe(false);
    });

    it('should return 400 if refresh token is missing', async () => {
      const response = await request(app).post('/api/auth/refresh').send({});

      expect(response.status).toBe(400);
      expect((response.body as ApiResponse).success).toBe(false);
      expect((response.body as ApiResponse).error!.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user info for valid access token', async () => {
      const payload: JwtPayload = { userId: testUser.id, role: testUser.role };
      const tokens = generateTokenPair(payload);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${tokens.accessToken}`);

      expect(response.status).toBe(200);
      expect((response.body as ApiResponse).success).toBe(true);
      expect((response.body as ApiResponse).data!.user!.userId).toBe(testUser.id);
      expect((response.body as ApiResponse).data!.user!.role).toBe(testUser.role);
    });

    it('should return 401 without authorization header', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect((response.body as ApiResponse).success).toBe(false);
      expect((response.body as ApiResponse).error!.code).toBe('UNAUTHORIZED');
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect((response.body as ApiResponse).success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should successfully logout with valid token', async () => {
      const payload: JwtPayload = { userId: testUser.id, role: testUser.role };
      const tokens = generateTokenPair(payload);

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${tokens.accessToken}`);

      expect(response.status).toBe(200);
      expect((response.body as ApiResponse).success).toBe(true);
      expect(redisModule.deleteRefreshToken).toHaveBeenCalledWith(testUser.id);
    });

    it('should return 401 without authorization', async () => {
      const response = await request(app).post('/api/auth/logout');

      expect(response.status).toBe(401);
      expect((response.body as ApiResponse).success).toBe(false);
    });
  });

  describe('GET /api/auth/admin-only', () => {
    it('should allow access for admin user', async () => {
      const payload: JwtPayload = { userId: testUser.id, role: 'ADMIN' };
      const tokens = generateTokenPair(payload);

      const response = await request(app)
        .get('/api/auth/admin-only')
        .set('Authorization', `Bearer ${tokens.accessToken}`);

      expect(response.status).toBe(200);
      expect((response.body as ApiResponse).success).toBe(true);
      expect((response.body as ApiResponse).data!.message).toBe('Welcome, admin!');
    });

    it('should return 403 for non-admin user', async () => {
      const payload: JwtPayload = { userId: testUser.id, role: 'STUDENT' };
      const tokens = generateTokenPair(payload);

      const response = await request(app)
        .get('/api/auth/admin-only')
        .set('Authorization', `Bearer ${tokens.accessToken}`);

      expect(response.status).toBe(403);
      expect((response.body as ApiResponse).success).toBe(false);
      expect((response.body as ApiResponse).error!.code).toBe('FORBIDDEN');
    });

    it('should return 403 for teacher user', async () => {
      const payload: JwtPayload = { userId: testUser.id, role: 'TEACHER' };
      const tokens = generateTokenPair(payload);

      const response = await request(app)
        .get('/api/auth/admin-only')
        .set('Authorization', `Bearer ${tokens.accessToken}`);

      expect(response.status).toBe(403);
      expect((response.body as ApiResponse).success).toBe(false);
      expect((response.body as ApiResponse).error!.code).toBe('FORBIDDEN');
    });

    it('should return 401 without authorization', async () => {
      const response = await request(app).get('/api/auth/admin-only');

      expect(response.status).toBe(401);
      expect((response.body as ApiResponse).success).toBe(false);
    });
  });
});
