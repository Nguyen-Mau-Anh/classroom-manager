import request from 'supertest';

import { AppError } from '../errors/app-error';
import { teacherService } from '../services/teacher.service';
import { app } from '../server';
import { generateTokenPair } from '../utils/jwt';

// Mock the teacher service
jest.mock('../services/teacher.service', () => ({
  teacherService: {
    create: jest.fn(),
    list: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    calculateWorkload: jest.fn(),
  },
}));

describe('Teacher Routes', () => {
  let adminToken: string;
  let teacherToken: string;

  beforeAll(() => {
    // Generate tokens for testing
    adminToken = generateTokenPair({ userId: 'admin-1', role: 'ADMIN' }).accessToken;
    teacherToken = generateTokenPair({ userId: 'teacher-1', role: 'TEACHER' }).accessToken;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/teachers', () => {
    it('should create a teacher with valid data', async () => {
      const mockTeacher = {
        id: 'teacher-1',
        name: 'John Doe',
        email: 'john.doe@school.edu',
        phone: '+84901234567',
        qualifications: [],
        weeklyHours: 0,
        isActive: true,
      };

      (teacherService.create as jest.Mock).mockResolvedValue(mockTeacher);

      const response = await request(app)
        .post('/api/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'John Doe',
          email: 'john.doe@school.edu',
          phone: '+84901234567',
          subjectIds: [],
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('John Doe');
      expect(response.body.data.email).toBe('john.doe@school.edu');
    });

    it('should return 400 for duplicate email', async () => {
      (teacherService.create as jest.Mock).mockRejectedValue(AppError.validation('Email already in use', [{ field: 'email', message: 'Email already in use' }]));

      const response = await request(app)
        .post('/api/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'John Doe 2',
          email: 'john.doe@school.edu',
          phone: '+84901234567',
          subjectIds: [],
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'John Doe',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 for missing auth token', async () => {
      const response = await request(app).post('/api/teachers').send({
        name: 'Jane Doe',
        email: 'jane.doe@school.edu',
        phone: '+84901234567',
        subjectIds: [],
      });

      expect(response.status).toBe(401);
    });

    it('should return 403 for non-admin user', async () => {
      const response = await request(app)
        .post('/api/teachers')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          name: 'Jane Doe',
          email: 'jane.doe@school.edu',
          phone: '+84901234567',
          subjectIds: [],
        });

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/teachers', () => {
    it('should return paginated list of teachers', async () => {
      const mockResult = {
        teachers: [
          {
            id: 'teacher-1',
            name: 'John Doe',
            email: 'john@school.edu',
            phone: '+84901234567',
            qualifications: [],
            weeklyHours: 0,
            isActive: true,
          },
        ],
        pagination: {
          page: 1,
          pageSize: 20,
          total: 1,
          totalPages: 1,
        },
      };

      (teacherService.list as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/api/teachers')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.teachers).toBeInstanceOf(Array);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination.page).toBe(1);
    });

    it('should filter teachers by search query', async () => {
      const mockResult = {
        teachers: [],
        pagination: {
          page: 1,
          pageSize: 20,
          total: 0,
          totalPages: 0,
        },
      };

      (teacherService.list as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/api/teachers?search=john')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should support pagination parameters', async () => {
      const mockResult = {
        teachers: [],
        pagination: {
          page: 1,
          pageSize: 10,
          total: 0,
          totalPages: 0,
        },
      };

      (teacherService.list as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/api/teachers?page=1&pageSize=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.pageSize).toBe(10);
    });
  });

  describe('GET /api/teachers/:id', () => {
    const teacherId = 'teacher-123';

    it('should return teacher by ID', async () => {
      const mockTeacher = {
        id: teacherId,
        name: 'Test Teacher',
        email: 'test.teacher@school.edu',
        phone: '+84901234567',
        qualifications: [],
        weeklyHours: 0,
        isActive: true,
      };

      (teacherService.getById as jest.Mock).mockResolvedValue(mockTeacher);

      const response = await request(app)
        .get(`/api/teachers/${teacherId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(teacherId);
      expect(response.body.data.name).toBe('Test Teacher');
    });

    it('should return 404 for non-existent teacher', async () => {
      (teacherService.getById as jest.Mock).mockRejectedValue(AppError.notFound('Teacher'));

      const response = await request(app)
        .get('/api/teachers/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/teachers/:id', () => {
    const teacherId = 'teacher-update-123';

    it('should update teacher successfully', async () => {
      const mockUpdatedTeacher = {
        id: teacherId,
        name: 'Updated Name',
        email: 'update.test@school.edu',
        phone: '+84999999999',
        qualifications: [],
        weeklyHours: 0,
        isActive: true,
      };

      (teacherService.update as jest.Mock).mockResolvedValue(mockUpdatedTeacher);

      const response = await request(app)
        .put(`/api/teachers/${teacherId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Name',
          phone: '+84999999999',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Name');
      expect(response.body.data.phone).toBe('+84999999999');
    });

    it('should return 404 for non-existent teacher', async () => {
      (teacherService.update as jest.Mock).mockRejectedValue(AppError.notFound('Teacher'));

      const response = await request(app)
        .put('/api/teachers/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Name',
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/teachers/:id', () => {
    const teacherId = 'teacher-delete-123';

    it('should soft delete teacher successfully', async () => {
      (teacherService.softDelete as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .delete(`/api/teachers/${teacherId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(teacherService.softDelete as jest.Mock).toHaveBeenCalledWith(teacherId);
    });

    it('should return 404 for non-existent teacher', async () => {
      (teacherService.softDelete as jest.Mock).mockRejectedValue(AppError.notFound('Teacher'));

      const response = await request(app)
        .delete('/api/teachers/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/teachers/:id/workload', () => {
    const teacherId = 'teacher-workload-123';

    it('should return teacher workload', async () => {
      const mockWorkload = {
        teacherId,
        weeklyHours: 15.5,
      };

      (teacherService.calculateWorkload as jest.Mock).mockResolvedValue(mockWorkload);

      const response = await request(app)
        .get(`/api/teachers/${teacherId}/workload`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.teacherId).toBe(teacherId);
      expect(response.body.data.weeklyHours).toBeDefined();
    });

    it('should return 404 for non-existent teacher', async () => {
      (teacherService.calculateWorkload as jest.Mock).mockRejectedValue(AppError.notFound('Teacher'));

      const response = await request(app)
        .get('/api/teachers/non-existent-id/workload')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });
});
