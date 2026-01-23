import express, { Express } from 'express';
import request from 'supertest';

import { errorHandler } from '../middlewares/error-handler.middleware';
import { authService } from '../services/auth.service';

import subjectRoutes from './subject.routes';

// Mock dependencies
jest.mock('../services/auth.service');
jest.mock('../controllers/subject.controller', () => ({
  subjectController: {
    create: jest.fn((_req, res) => {
      res.status(201).json({ success: true, data: { id: 'subject-1', name: 'Math' } });
    }),
    list: jest.fn((_req, res) => {
      res.status(200).json({ success: true, data: { subjects: [], pagination: {} } });
    }),
    getById: jest.fn((_req, res) => {
      res.status(200).json({ success: true, data: { id: 'subject-1', name: 'Math' } });
    }),
    update: jest.fn((_req, res) => {
      res.status(200).json({ success: true, data: { id: 'subject-1', name: 'Math Updated' } });
    }),
    delete: jest.fn((_req, res) => {
      res.status(200).json({ success: true, data: { deleted: true } });
    }),
    getQualifiedTeachers: jest.fn((_req, res) => {
      res.status(200).json({ success: true, data: { teachers: [] } });
    }),
    updateQualifiedTeachers: jest.fn((_req, res) => {
      res.status(200).json({ success: true, data: { teachers: [] } });
    }),
  },
}));

describe('Subject Routes - Authentication and Authorization', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/subjects', subjectRoutes);
    app.use(errorHandler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should return 401 if no authorization header is provided', async () => {
      const response = await request(app).get('/api/subjects');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('No authorization header provided');
    });

    it('should return 401 if authorization header is invalid', async () => {
      const response = await request(app)
        .get('/api/subjects')
        .set('Authorization', 'InvalidFormat token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Invalid authorization header format');
    });

    it('should return 401 if token is invalid', async () => {
      (authService.validateAccessToken as jest.Mock).mockImplementation(() => {
        throw { code: 'INVALID_TOKEN', message: 'Invalid token' };
      });

      const response = await request(app)
        .get('/api/subjects')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Authorization - Read Operations (All authenticated users)', () => {
    beforeEach(() => {
      (authService.validateAccessToken as jest.Mock).mockReturnValue({
        userId: 'user-123',
        role: 'STUDENT',
      });
    });

    it('should allow STUDENT to list subjects', async () => {
      const response = await request(app)
        .get('/api/subjects')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should allow STUDENT to get subject by ID', async () => {
      const response = await request(app)
        .get('/api/subjects/subject-1')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should allow STUDENT to get qualified teachers', async () => {
      const response = await request(app)
        .get('/api/subjects/subject-1/teachers')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should allow TEACHER to list subjects', async () => {
      (authService.validateAccessToken as jest.Mock).mockReturnValue({
        userId: 'user-456',
        role: 'TEACHER',
      });

      const response = await request(app)
        .get('/api/subjects')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should allow TEACHER to get subject by ID', async () => {
      (authService.validateAccessToken as jest.Mock).mockReturnValue({
        userId: 'user-456',
        role: 'TEACHER',
      });

      const response = await request(app)
        .get('/api/subjects/subject-1')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Authorization - Write Operations (ADMIN only)', () => {
    describe('Non-ADMIN users should be forbidden', () => {
      it('should return 403 when STUDENT attempts to create subject', async () => {
        (authService.validateAccessToken as jest.Mock).mockReturnValue({
          userId: 'user-123',
          role: 'STUDENT',
        });

        const response = await request(app)
          .post('/api/subjects')
          .set('Authorization', 'Bearer valid-token')
          .send({
            name: 'Math',
            code: 'MATH101',
            description: 'Mathematics',
            isMandatory: false,
          });

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toBe('Insufficient permissions');
      });

      it('should return 403 when TEACHER attempts to create subject', async () => {
        (authService.validateAccessToken as jest.Mock).mockReturnValue({
          userId: 'user-456',
          role: 'TEACHER',
        });

        const response = await request(app)
          .post('/api/subjects')
          .set('Authorization', 'Bearer valid-token')
          .send({
            name: 'Math',
            code: 'MATH101',
            description: 'Mathematics',
            isMandatory: false,
          });

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toBe('Insufficient permissions');
      });

      it('should return 403 when STUDENT attempts to update subject', async () => {
        (authService.validateAccessToken as jest.Mock).mockReturnValue({
          userId: 'user-123',
          role: 'STUDENT',
        });

        const response = await request(app)
          .put('/api/subjects/subject-1')
          .set('Authorization', 'Bearer valid-token')
          .send({
            name: 'Math Updated',
          });

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toBe('Insufficient permissions');
      });

      it('should return 403 when TEACHER attempts to update subject', async () => {
        (authService.validateAccessToken as jest.Mock).mockReturnValue({
          userId: 'user-456',
          role: 'TEACHER',
        });

        const response = await request(app)
          .put('/api/subjects/subject-1')
          .set('Authorization', 'Bearer valid-token')
          .send({
            name: 'Math Updated',
          });

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toBe('Insufficient permissions');
      });

      it('should return 403 when STUDENT attempts to delete subject', async () => {
        (authService.validateAccessToken as jest.Mock).mockReturnValue({
          userId: 'user-123',
          role: 'STUDENT',
        });

        const response = await request(app)
          .delete('/api/subjects/subject-1')
          .set('Authorization', 'Bearer valid-token');

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toBe('Insufficient permissions');
      });

      it('should return 403 when TEACHER attempts to delete subject', async () => {
        (authService.validateAccessToken as jest.Mock).mockReturnValue({
          userId: 'user-456',
          role: 'TEACHER',
        });

        const response = await request(app)
          .delete('/api/subjects/subject-1')
          .set('Authorization', 'Bearer valid-token');

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toBe('Insufficient permissions');
      });

      it('should return 403 when STUDENT attempts to update qualified teachers', async () => {
        (authService.validateAccessToken as jest.Mock).mockReturnValue({
          userId: 'user-123',
          role: 'STUDENT',
        });

        const response = await request(app)
          .put('/api/subjects/subject-1/teachers')
          .set('Authorization', 'Bearer valid-token')
          .send({
            teacherIds: ['teacher-1', 'teacher-2'],
          });

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toBe('Insufficient permissions');
      });

      it('should return 403 when TEACHER attempts to update qualified teachers', async () => {
        (authService.validateAccessToken as jest.Mock).mockReturnValue({
          userId: 'user-456',
          role: 'TEACHER',
        });

        const response = await request(app)
          .put('/api/subjects/subject-1/teachers')
          .set('Authorization', 'Bearer valid-token')
          .send({
            teacherIds: ['teacher-1', 'teacher-2'],
          });

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toBe('Insufficient permissions');
      });
    });

    describe('ADMIN users should be allowed', () => {
      beforeEach(() => {
        (authService.validateAccessToken as jest.Mock).mockReturnValue({
          userId: 'admin-123',
          role: 'ADMIN',
        });
      });

      it('should allow ADMIN to create subject', async () => {
        const response = await request(app)
          .post('/api/subjects')
          .set('Authorization', 'Bearer valid-token')
          .send({
            name: 'Math',
            code: 'MATH101',
            description: 'Mathematics',
            isMandatory: false,
          });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });

      it('should allow ADMIN to update subject', async () => {
        const response = await request(app)
          .put('/api/subjects/subject-1')
          .set('Authorization', 'Bearer valid-token')
          .send({
            name: 'Math Updated',
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      it('should allow ADMIN to delete subject', async () => {
        const response = await request(app)
          .delete('/api/subjects/subject-1')
          .set('Authorization', 'Bearer valid-token');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      it('should allow ADMIN to update qualified teachers', async () => {
        const response = await request(app)
          .put('/api/subjects/subject-1/teachers')
          .set('Authorization', 'Bearer valid-token')
          .send({
            teacherIds: ['teacher-1', 'teacher-2'],
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing token after Bearer keyword', async () => {
      const response = await request(app).get('/api/subjects').set('Authorization', 'Bearer ');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should handle token without Bearer prefix', async () => {
      const response = await request(app).get('/api/subjects').set('Authorization', 'some-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Invalid authorization header format');
    });

    it('should handle expired token', async () => {
      (authService.validateAccessToken as jest.Mock).mockImplementation(() => {
        throw { code: 'TOKEN_EXPIRED', message: 'Token has expired' };
      });

      const response = await request(app)
        .get('/api/subjects')
        .set('Authorization', 'Bearer expired-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
