import request from 'supertest';

import { AppError } from '../errors/app-error';
import { app } from '../server';
import { studentService } from '../services/student.service';
import { generateTokenPair } from '../utils/jwt';

// Mock the student service
jest.mock('../services/student.service', () => ({
  studentService: {
    create: jest.fn(),
    list: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    parseCSV: jest.fn(),
    bulkCreate: jest.fn(),
  },
}));

describe('Student Routes', () => {
  let adminToken: string;
  let teacherToken: string;
  let studentToken: string;

  beforeAll(() => {
    // Generate tokens for testing
    adminToken = generateTokenPair({ userId: 'admin-1', role: 'ADMIN' }).accessToken;
    teacherToken = generateTokenPair({ userId: 'teacher-1', role: 'TEACHER' }).accessToken;
    studentToken = generateTokenPair({ userId: 'student-1', role: 'STUDENT' }).accessToken;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/students', () => {
    it('should create a student with valid data (admin)', async () => {
      const mockStudent = {
        id: 'student-1',
        name: 'Tran Thi B',
        email: 'tranthib@school.edu',
        gradeLevel: 10,
        isActive: true,
        generatedPassword: 'temp-pass-123',
        class: { id: 'class-1', name: '10A' },
        enrollmentCount: 0,
      };

      (studentService.create as jest.Mock).mockResolvedValue(mockStudent);

      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Tran Thi B',
          email: 'tranthib@school.edu',
          gradeLevel: 10,
          classId: 'class-1',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Tran Thi B');
      expect(response.body.data.generatedPassword).toBe('temp-pass-123');
    });

    it('should create a student with valid data (teacher)', async () => {
      const mockStudent = {
        id: 'student-2',
        name: 'Nguyen Van C',
        email: 'nguyenvanc@school.edu',
        gradeLevel: 11,
        isActive: true,
        generatedPassword: 'temp-pass-456',
        class: null,
        enrollmentCount: 0,
      };

      (studentService.create as jest.Mock).mockResolvedValue(mockStudent);

      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          name: 'Nguyen Van C',
          email: 'nguyenvanc@school.edu',
          gradeLevel: 11,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Nguyen Van C');
    });

    it('should return 403 for student role', async () => {
      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          name: 'Test Student',
          email: 'test@school.edu',
          gradeLevel: 10,
        });

      expect(response.status).toBe(403);
    });

    it('should return 400 for duplicate email', async () => {
      (studentService.create as jest.Mock).mockRejectedValue(
        AppError.validation('Email already in use', [
          { field: 'email', message: 'This email is already registered' },
        ])
      );

      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Duplicate Student',
          email: 'duplicate@school.edu',
          gradeLevel: 10,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid grade level', async () => {
      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Student',
          email: 'test@school.edu',
          gradeLevel: 15, // Invalid
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/students', () => {
    it('should list students with pagination', async () => {
      const mockResult = {
        students: [
          {
            id: 'student-1',
            name: 'Student A',
            email: 'studenta@school.edu',
            gradeLevel: 10,
            isActive: true,
            class: { id: 'class-1', name: '10A' },
            enrollmentCount: 12,
            isUnderEnrolled: false,
          },
        ],
        pagination: {
          page: 1,
          pageSize: 20,
          total: 1,
          totalPages: 1,
        },
      };

      (studentService.list as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, pageSize: 20 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.students).toHaveLength(1);
    });

    it('should filter by under-enrolled students', async () => {
      const mockResult = {
        students: [
          {
            id: 'student-1',
            name: 'Student A',
            email: 'studenta@school.edu',
            gradeLevel: 10,
            isActive: true,
            class: { id: 'class-1', name: '10A' },
            enrollmentCount: 8,
            isUnderEnrolled: true,
          },
        ],
        pagination: {
          page: 1,
          pageSize: 20,
          total: 1,
          totalPages: 1,
        },
      };

      (studentService.list as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ underEnrolled: 'true' });

      expect(response.status).toBe(200);
      expect(response.body.data.students[0].isUnderEnrolled).toBe(true);
    });
  });

  describe('GET /api/students/:id', () => {
    it('should get student by ID', async () => {
      const mockStudent = {
        id: 'student-1',
        name: 'Student A',
        email: 'studenta@school.edu',
        gradeLevel: 10,
        isActive: true,
        class: { id: 'class-1', name: '10A' },
        enrollments: [
          { id: 'enroll-1', subjectId: 'subject-1', subjectName: 'Math', subjectCode: 'MATH' },
        ],
      };

      (studentService.getById as jest.Mock).mockResolvedValue(mockStudent);

      const response = await request(app)
        .get('/api/students/student-1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe('student-1');
      expect(response.body.data.enrollments).toHaveLength(1);
    });

    it('should return 404 for non-existent student', async () => {
      (studentService.getById as jest.Mock).mockRejectedValue(
        AppError.notFound('Student not found')
      );

      const response = await request(app)
        .get('/api/students/nonexistent')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/students/:id', () => {
    it('should update student profile', async () => {
      const mockStudent = {
        id: 'student-1',
        name: 'Updated Name',
        email: 'student@school.edu',
        gradeLevel: 11,
        isActive: true,
        class: null,
        enrollmentCount: 10,
      };

      (studentService.update as jest.Mock).mockResolvedValue(mockStudent);

      const response = await request(app)
        .put('/api/students/student-1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Name',
          gradeLevel: 11,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Updated Name');
      expect(response.body.data.gradeLevel).toBe(11);
    });
  });

  describe('DELETE /api/students/:id', () => {
    it('should soft delete student', async () => {
      (studentService.softDelete as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .delete('/api/students/student-1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/students/import', () => {
    it('should parse CSV and return preview', async () => {
      const mockResult = {
        validRows: [
          {
            rowNumber: 1,
            data: {
              name: 'Student A',
              email: 'studenta@school.edu',
              gradeLevel: 10,
              className: '10A',
            },
          },
        ],
        invalidRows: [
          {
            rowNumber: 2,
            data: { name: 'Student B', email: 'invalid-email', gradeLevel: 10 },
            errors: ['Invalid email format'],
          },
        ],
        summary: {
          total: 2,
          valid: 1,
          invalid: 1,
        },
      };

      (studentService.parseCSV as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/students/import')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach(
          'file',
          Buffer.from('name,email,gradeLevel\nTest,test@school.edu,10'),
          'students.csv'
        );

      expect(response.status).toBe(200);
      expect(response.body.data.summary.valid).toBe(1);
      expect(response.body.data.summary.invalid).toBe(1);
    });

    it('should return 400 if no file uploaded', async () => {
      const response = await request(app)
        .post('/api/students/import')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/students/import/confirm', () => {
    it('should bulk create students from valid rows', async () => {
      const mockResult = {
        created: 2,
        students: [
          {
            id: 'student-1',
            name: 'Student A',
            email: 'studenta@school.edu',
            gradeLevel: 10,
            class: null,
          },
          {
            id: 'student-2',
            name: 'Student B',
            email: 'studentb@school.edu',
            gradeLevel: 11,
            class: null,
          },
        ],
      };

      (studentService.bulkCreate as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/students/import/confirm')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          validRows: [
            { name: 'Student A', email: 'studenta@school.edu', gradeLevel: 10 },
            { name: 'Student B', email: 'studentb@school.edu', gradeLevel: 11 },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body.data.created).toBe(2);
      expect(response.body.data.students).toHaveLength(2);
    });
  });
});
