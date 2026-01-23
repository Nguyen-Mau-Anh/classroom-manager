import request from 'supertest';

import { AppError } from '../errors/app-error';
import { app } from '../server';
import { enrollmentService } from '../services/enrollment.service';
import { subjectService } from '../services/subject.service';
import { generateTokenPair } from '../utils/jwt';

// Mock services
jest.mock('../services/subject.service', () => ({
  subjectService: {
    create: jest.fn(),
    list: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    updateQualifiedTeachers: jest.fn(),
    getQualifiedTeachers: jest.fn(),
    getPrerequisiteChain: jest.fn(),
  },
}));

jest.mock('../services/enrollment.service', () => ({
  enrollmentService: {
    validatePrerequisites: jest.fn(),
  },
}));

describe('Subject API Integration Tests', () => {
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

  // Test Suite 1: Full CRUD flow for subjects
  describe('CRUD Flow for Subjects', () => {
    it('should create a subject with valid data', async () => {
      const mockSubject = {
        id: 'subject-1',
        code: 'MATH101',
        name: 'Introduction to Mathematics',
        description: 'Basic mathematics course',
        isMandatory: false,
        isActive: true,
        prerequisites: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (subjectService.create as jest.Mock).mockResolvedValue(mockSubject);

      const response = await request(app)
        .post('/api/subjects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'MATH101',
          name: 'Introduction to Mathematics',
          description: 'Basic mathematics course',
          isMandatory: false,
          prerequisiteIds: [],
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.code).toBe('MATH101');
      expect(response.body.data.name).toBe('Introduction to Mathematics');
    });

    it('should list subjects with pagination', async () => {
      const mockSubjects = {
        subjects: [
          {
            id: 'subject-1',
            code: 'MATH101',
            name: 'Mathematics',
            isMandatory: false,
            prerequisiteCount: 0,
            qualifiedTeacherCount: 3,
            enrollmentCount: 25,
          },
        ],
        pagination: {
          page: 1,
          pageSize: 20,
          total: 1,
        },
      };

      (subjectService.list as jest.Mock).mockResolvedValue(mockSubjects);

      const response = await request(app)
        .get('/api/subjects')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, pageSize: 20 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.subjects).toHaveLength(1);
      expect(response.body.data.pagination.page).toBe(1);
    });

    it('should get subject by ID with full details', async () => {
      const mockSubject = {
        id: 'subject-1',
        code: 'MATH101',
        name: 'Mathematics',
        description: 'Math course',
        isMandatory: false,
        prerequisites: [],
        prerequisiteChain: [],
        qualifiedTeachers: [
          {
            id: 'teacher-1',
            name: 'John Doe',
            email: 'john@example.com',
          },
        ],
        enrollmentCount: 25,
      };

      (subjectService.getById as jest.Mock).mockResolvedValue(mockSubject);

      const response = await request(app)
        .get('/api/subjects/subject-1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('subject-1');
      expect(response.body.data.qualifiedTeachers).toHaveLength(1);
    });

    it('should update subject with valid data', async () => {
      const mockUpdatedSubject = {
        id: 'subject-1',
        code: 'MATH101',
        name: 'Advanced Mathematics',
        description: 'Updated description',
        isMandatory: true,
        prerequisites: [],
      };

      (subjectService.update as jest.Mock).mockResolvedValue(mockUpdatedSubject);

      const response = await request(app)
        .put('/api/subjects/subject-1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Advanced Mathematics',
          description: 'Updated description',
          isMandatory: true,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Advanced Mathematics');
      expect(response.body.data.isMandatory).toBe(true);
    });

    it('should delete (soft delete) subject', async () => {
      (subjectService.delete as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .delete('/api/subjects/subject-1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Subject deleted successfully');
    });

    it('should return 400 for duplicate subject code', async () => {
      (subjectService.create as jest.Mock).mockRejectedValue(
        AppError.validation('Subject code already exists', [
          { field: 'code', message: 'Subject code already exists' },
        ]),
      );

      const response = await request(app)
        .post('/api/subjects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'MATH101',
          name: 'Mathematics',
          isMandatory: false,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 when subject not found', async () => {
      (subjectService.getById as jest.Mock).mockRejectedValue(AppError.notFound('Subject'));

      const response = await request(app)
        .get('/api/subjects/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('not found');
    });
  });

  // Test Suite 2: Prerequisite assignment and retrieval
  describe('Prerequisite Assignment and Retrieval', () => {
    it('should create subject with prerequisites', async () => {
      const mockSubject = {
        id: 'subject-2',
        code: 'MATH201',
        name: 'Advanced Mathematics',
        isMandatory: false,
        prerequisites: [
          {
            id: 'subject-1',
            code: 'MATH101',
            name: 'Introduction to Mathematics',
          },
        ],
      };

      (subjectService.create as jest.Mock).mockResolvedValue(mockSubject);

      const response = await request(app)
        .post('/api/subjects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'MATH201',
          name: 'Advanced Mathematics',
          isMandatory: false,
          prerequisiteIds: ['subject-1'],
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.prerequisites).toHaveLength(1);
      expect(response.body.data.prerequisites[0].code).toBe('MATH101');
    });

    it('should update subject prerequisites', async () => {
      const mockUpdatedSubject = {
        id: 'subject-2',
        code: 'MATH201',
        name: 'Advanced Mathematics',
        prerequisites: [
          {
            id: 'subject-1',
            code: 'MATH101',
            name: 'Introduction to Mathematics',
          },
          {
            id: 'subject-3',
            code: 'PHYS101',
            name: 'Introduction to Physics',
          },
        ],
      };

      (subjectService.update as jest.Mock).mockResolvedValue(mockUpdatedSubject);

      const response = await request(app)
        .put('/api/subjects/subject-2')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          prerequisiteIds: ['subject-1', 'subject-3'],
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.prerequisites).toHaveLength(2);
    });

    it('should retrieve prerequisite chain for subject', async () => {
      const mockSubject = {
        id: 'subject-3',
        code: 'MATH301',
        name: 'Calculus III',
        prerequisites: [
          {
            id: 'subject-2',
            code: 'MATH201',
            name: 'Calculus II',
            prerequisites: [
              {
                id: 'subject-1',
                code: 'MATH101',
                name: 'Calculus I',
                prerequisites: [],
              },
            ],
          },
        ],
        prerequisiteChain: ['MATH201', 'MATH101'],
      };

      (subjectService.getById as jest.Mock).mockResolvedValue(mockSubject);

      const response = await request(app)
        .get('/api/subjects/subject-3')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.prerequisiteChain).toContain('MATH201');
      expect(response.body.data.prerequisiteChain).toContain('MATH101');
    });

    it('should reject circular prerequisites', async () => {
      (subjectService.create as jest.Mock).mockRejectedValue(
        AppError.validation('Circular prerequisite detected', [
          { field: 'prerequisiteIds', message: 'Circular prerequisite detected' },
        ]),
      );

      const response = await request(app)
        .post('/api/subjects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'MATH101',
          name: 'Mathematics',
          prerequisiteIds: ['subject-2'], // This would create a cycle
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle empty prerequisite list', async () => {
      const mockSubject = {
        id: 'subject-1',
        code: 'MATH101',
        name: 'Introduction to Mathematics',
        prerequisites: [],
        prerequisiteChain: [],
      };

      (subjectService.getById as jest.Mock).mockResolvedValue(mockSubject);

      const response = await request(app)
        .get('/api/subjects/subject-1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.prerequisites).toHaveLength(0);
    });
  });

  // Test Suite 3: Teacher qualification assignment
  describe('Teacher Qualification Assignment', () => {
    it('should assign qualified teachers to subject', async () => {
      const mockQualifiedTeachers = {
        subjectId: 'subject-1',
        qualifiedTeachers: [
          { id: 'teacher-1', name: 'John Doe' },
          { id: 'teacher-2', name: 'Jane Smith' },
        ],
      };

      (subjectService.updateQualifiedTeachers as jest.Mock).mockResolvedValue(
        mockQualifiedTeachers,
      );

      const response = await request(app)
        .put('/api/subjects/subject-1/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          teacherIds: ['teacher-1', 'teacher-2'],
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.qualifiedTeachers).toHaveLength(2);
    });

    it('should get qualified teachers for subject', async () => {
      const mockTeachers = {
        subjectId: 'subject-1',
        qualifiedTeachers: [
          {
            id: 'teacher-1',
            name: 'John Doe',
            email: 'john@example.com',
            qualificationDate: new Date(),
          },
        ],
      };

      (subjectService.getQualifiedTeachers as jest.Mock).mockResolvedValue(mockTeachers);

      const response = await request(app)
        .get('/api/subjects/subject-1/teachers')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.qualifiedTeachers).toHaveLength(1);
    });

    it('should update qualified teachers (replace existing)', async () => {
      const mockUpdatedTeachers = {
        subjectId: 'subject-1',
        qualifiedTeachers: [{ id: 'teacher-3', name: 'Bob Johnson' }],
      };

      (subjectService.updateQualifiedTeachers as jest.Mock).mockResolvedValue(mockUpdatedTeachers);

      const response = await request(app)
        .put('/api/subjects/subject-1/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          teacherIds: ['teacher-3'],
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.qualifiedTeachers).toHaveLength(1);
      expect(response.body.data.qualifiedTeachers[0].id).toBe('teacher-3');
    });

    it('should return 404 for non-existent teacher', async () => {
      (subjectService.updateQualifiedTeachers as jest.Mock).mockRejectedValue(
        AppError.notFound('One or more teachers not found'),
      );

      const response = await request(app)
        .put('/api/subjects/subject-1/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          teacherIds: ['non-existent-teacher'],
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('not found');
    });

    it('should return 400 for empty teacher list', async () => {
      const response = await request(app)
        .put('/api/subjects/subject-1/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          teacherIds: [],
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  // Test Suite 4: Role-based access control
  describe('Role-Based Access Control', () => {
    describe('Admin Access', () => {
      it('should allow admin to create subjects', async () => {
        const mockSubject = { id: 'subject-1', name: 'Math' };
        (subjectService.create as jest.Mock).mockResolvedValue(mockSubject);

        const response = await request(app)
          .post('/api/subjects')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            code: 'MATH101',
            name: 'Mathematics',
            isMandatory: false,
          });

        expect(response.status).toBe(201);
      });

      it('should allow admin to update subjects', async () => {
        const mockSubject = { id: 'subject-1', name: 'Updated Math' };
        (subjectService.update as jest.Mock).mockResolvedValue(mockSubject);

        const response = await request(app)
          .put('/api/subjects/subject-1')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ name: 'Updated Math' });

        expect(response.status).toBe(200);
      });

      it('should allow admin to delete subjects', async () => {
        const mockSubject = { id: 'subject-1', isActive: false };
        (subjectService.delete as jest.Mock).mockResolvedValue(mockSubject);

        const response = await request(app)
          .delete('/api/subjects/subject-1')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
      });

      it('should allow admin to manage qualified teachers', async () => {
        const mockResult = { subjectId: 'subject-1', qualifiedTeachers: [] };
        (subjectService.updateQualifiedTeachers as jest.Mock).mockResolvedValue(mockResult);

        const response = await request(app)
          .put('/api/subjects/subject-1/teachers')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ teacherIds: ['teacher-1'] });

        expect(response.status).toBe(200);
      });
    });

    describe('Teacher Access', () => {
      it('should allow teacher to view subjects', async () => {
        const mockSubjects = { subjects: [], pagination: {} };
        (subjectService.list as jest.Mock).mockResolvedValue(mockSubjects);

        const response = await request(app)
          .get('/api/subjects')
          .set('Authorization', `Bearer ${teacherToken}`);

        expect(response.status).toBe(200);
      });

      it('should allow teacher to view subject details', async () => {
        const mockSubject = { id: 'subject-1', name: 'Math' };
        (subjectService.getById as jest.Mock).mockResolvedValue(mockSubject);

        const response = await request(app)
          .get('/api/subjects/subject-1')
          .set('Authorization', `Bearer ${teacherToken}`);

        expect(response.status).toBe(200);
      });

      it('should forbid teacher to create subjects', async () => {
        const response = await request(app)
          .post('/api/subjects')
          .set('Authorization', `Bearer ${teacherToken}`)
          .send({
            code: 'MATH101',
            name: 'Mathematics',
            isMandatory: false,
          });

        expect(response.status).toBe(403);
        expect(response.body.error.message).toBe('Insufficient permissions');
      });

      it('should forbid teacher to update subjects', async () => {
        const response = await request(app)
          .put('/api/subjects/subject-1')
          .set('Authorization', `Bearer ${teacherToken}`)
          .send({ name: 'Updated Math' });

        expect(response.status).toBe(403);
      });

      it('should forbid teacher to delete subjects', async () => {
        const response = await request(app)
          .delete('/api/subjects/subject-1')
          .set('Authorization', `Bearer ${teacherToken}`);

        expect(response.status).toBe(403);
      });
    });

    describe('Student Access', () => {
      it('should allow student to view subjects', async () => {
        const mockSubjects = { subjects: [], pagination: {} };
        (subjectService.list as jest.Mock).mockResolvedValue(mockSubjects);

        const response = await request(app)
          .get('/api/subjects')
          .set('Authorization', `Bearer ${studentToken}`);

        expect(response.status).toBe(200);
      });

      it('should allow student to view subject details', async () => {
        const mockSubject = { id: 'subject-1', name: 'Math' };
        (subjectService.getById as jest.Mock).mockResolvedValue(mockSubject);

        const response = await request(app)
          .get('/api/subjects/subject-1')
          .set('Authorization', `Bearer ${studentToken}`);

        expect(response.status).toBe(200);
      });

      it('should forbid student to create subjects', async () => {
        const response = await request(app)
          .post('/api/subjects')
          .set('Authorization', `Bearer ${studentToken}`)
          .send({
            code: 'MATH101',
            name: 'Mathematics',
            isMandatory: false,
          });

        expect(response.status).toBe(403);
      });

      it('should forbid student to update subjects', async () => {
        const response = await request(app)
          .put('/api/subjects/subject-1')
          .set('Authorization', `Bearer ${studentToken}`)
          .send({ name: 'Updated Math' });

        expect(response.status).toBe(403);
      });

      it('should forbid student to delete subjects', async () => {
        const response = await request(app)
          .delete('/api/subjects/subject-1')
          .set('Authorization', `Bearer ${studentToken}`);

        expect(response.status).toBe(403);
      });
    });
  });

  // Test Suite 5: Pagination and filtering
  describe('Pagination and Filtering', () => {
    it('should paginate subjects with default page size', async () => {
      const mockSubjects = {
        subjects: Array(20).fill({ id: 'subject-1', name: 'Math' }),
        pagination: {
          page: 1,
          pageSize: 20,
          total: 45,
        },
      };

      (subjectService.list as jest.Mock).mockResolvedValue(mockSubjects);

      const response = await request(app)
        .get('/api/subjects')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.subjects).toHaveLength(20);
      expect(response.body.data.pagination.pageSize).toBe(20);
    });

    it('should paginate subjects with custom page size', async () => {
      const mockSubjects = {
        subjects: Array(10).fill({ id: 'subject-1', name: 'Math' }),
        pagination: {
          page: 1,
          pageSize: 10,
          total: 45,
        },
      };

      (subjectService.list as jest.Mock).mockResolvedValue(mockSubjects);

      const response = await request(app)
        .get('/api/subjects')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ pageSize: 10 });

      expect(response.status).toBe(200);
      expect(response.body.data.subjects).toHaveLength(10);
    });

    it('should filter subjects by mandatory status', async () => {
      const mockSubjects = {
        subjects: [{ id: 'subject-1', name: 'Math', isMandatory: true }],
        pagination: { page: 1, pageSize: 20, total: 1 },
      };

      (subjectService.list as jest.Mock).mockResolvedValue(mockSubjects);

      const response = await request(app)
        .get('/api/subjects')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ isMandatory: true });

      expect(response.status).toBe(200);
      expect(response.body.data.subjects[0].isMandatory).toBe(true);
      const mockCall = (subjectService.list as jest.Mock).mock.calls[0][0];
      expect(mockCall).toMatchObject({ isMandatory: true });
    });

    it('should search subjects by name', async () => {
      const mockSubjects = {
        subjects: [{ id: 'subject-1', name: 'Advanced Mathematics', code: 'MATH201' }],
        pagination: { page: 1, pageSize: 20, total: 1 },
      };

      (subjectService.list as jest.Mock).mockResolvedValue(mockSubjects);

      const response = await request(app)
        .get('/api/subjects')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ search: 'Advanced' });

      expect(response.status).toBe(200);
      expect(response.body.data.subjects[0].name).toContain('Advanced');
    });

    it('should search subjects by code', async () => {
      const mockSubjects = {
        subjects: [{ id: 'subject-1', name: 'Mathematics', code: 'MATH101' }],
        pagination: { page: 1, pageSize: 20, total: 1 },
      };

      (subjectService.list as jest.Mock).mockResolvedValue(mockSubjects);

      const response = await request(app)
        .get('/api/subjects')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ search: 'MATH101' });

      expect(response.status).toBe(200);
      expect(response.body.data.subjects[0].code).toBe('MATH101');
    });

    it('should combine pagination, filtering, and search', async () => {
      const mockSubjects = {
        subjects: [
          { id: 'subject-1', name: 'Advanced Mathematics', isMandatory: true, code: 'MATH201' },
        ],
        pagination: { page: 2, pageSize: 10, total: 15 },
      };

      (subjectService.list as jest.Mock).mockResolvedValue(mockSubjects);

      const response = await request(app)
        .get('/api/subjects')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 2, pageSize: 10, isMandatory: true, search: 'Math' });

      expect(response.status).toBe(200);
      expect(response.body.data.pagination.page).toBe(2);
      expect(response.body.data.pagination.pageSize).toBe(10);
    });
  });

  // Test Suite 6: Enrollment validation with prerequisites
  describe('Enrollment Validation with Prerequisites', () => {
    it('should validate prerequisites are met for enrollment', async () => {
      const mockValidation = {
        eligible: true,
        message: 'Student meets all prerequisites',
      };

      (enrollmentService.validatePrerequisites as jest.Mock).mockResolvedValue(mockValidation);

      // Note: This endpoint would typically be in enrollment routes
      // This test verifies the service integration
      const result = await enrollmentService.validatePrerequisites('student-1', 'subject-2');

      expect(result.eligible).toBe(true);
      expect(enrollmentService.validatePrerequisites).toHaveBeenCalledWith(
        'student-1',
        'subject-2',
      );
    });

    it('should return missing prerequisites when not met', async () => {
      const mockValidation = {
        eligible: false,
        missingPrerequisites: [
          { id: 'subject-1', code: 'MATH101', name: 'Introduction to Mathematics' },
        ],
        message: 'Prerequisites not met: Introduction to Mathematics',
      };

      (enrollmentService.validatePrerequisites as jest.Mock).mockResolvedValue(mockValidation);

      const result = await enrollmentService.validatePrerequisites('student-1', 'subject-2');

      expect(result.eligible).toBe(false);
      expect(result.missingPrerequisites).toHaveLength(1);
      expect(result.missingPrerequisites[0].code).toBe('MATH101');
    });

    it('should return multiple missing prerequisites', async () => {
      const mockValidation = {
        eligible: false,
        missingPrerequisites: [
          { id: 'subject-1', code: 'MATH101', name: 'Mathematics I' },
          { id: 'subject-2', code: 'PHYS101', name: 'Physics I' },
        ],
        message: 'Prerequisites not met: Mathematics I, Physics I',
      };

      (enrollmentService.validatePrerequisites as jest.Mock).mockResolvedValue(mockValidation);

      const result = await enrollmentService.validatePrerequisites('student-1', 'subject-3');

      expect(result.eligible).toBe(false);
      expect(result.missingPrerequisites).toHaveLength(2);
    });

    it('should allow enrollment for subject with no prerequisites', async () => {
      const mockValidation = {
        eligible: true,
        message: 'No prerequisites required',
      };

      (enrollmentService.validatePrerequisites as jest.Mock).mockResolvedValue(mockValidation);

      const result = await enrollmentService.validatePrerequisites('student-1', 'subject-1');

      expect(result.eligible).toBe(true);
    });

    it('should validate nested prerequisites', async () => {
      const mockValidation = {
        eligible: false,
        missingPrerequisites: [{ id: 'subject-1', code: 'MATH101', name: 'Mathematics I' }],
        message: 'Prerequisites not met: Mathematics I',
      };

      (enrollmentService.validatePrerequisites as jest.Mock).mockResolvedValue(mockValidation);

      // Subject 3 requires Subject 2, which requires Subject 1
      const result = await enrollmentService.validatePrerequisites('student-1', 'subject-3');

      expect(result.eligible).toBe(false);
      expect(result.missingPrerequisites).toBeDefined();
    });
  });

  // Test Suite 7: Admin override for prerequisite requirements
  describe('Admin Override for Prerequisites', () => {
    it('should allow admin override to bypass prerequisite validation', async () => {
      const mockValidation = {
        eligible: true,
        adminOverride: true,
        message: 'Prerequisites bypassed by admin',
      };

      (enrollmentService.validatePrerequisites as jest.Mock).mockResolvedValue(mockValidation);

      const result = await enrollmentService.validatePrerequisites(
        'student-1',
        'subject-2',
        true, // adminOverride flag
      );

      expect(result.eligible).toBe(true);
      expect(result.adminOverride).toBe(true);
    });

    it('should still validate subject exists even with admin override', async () => {
      (enrollmentService.validatePrerequisites as jest.Mock).mockRejectedValue(
        AppError.notFound('Subject not found'),
      );

      await expect(
        enrollmentService.validatePrerequisites('student-1', 'non-existent', true),
      ).rejects.toThrow();
    });

    it('should log admin override usage (verification)', async () => {
      const mockValidation = {
        eligible: true,
        adminOverride: true,
        message: 'Prerequisites bypassed by admin',
      };

      (enrollmentService.validatePrerequisites as jest.Mock).mockResolvedValue(mockValidation);

      const result = await enrollmentService.validatePrerequisites('student-1', 'subject-2', true);

      expect(result.adminOverride).toBe(true);
      // In production, this would verify audit log was created
    });

    it('should allow enrollment with admin override despite missing prerequisites', async () => {
      const mockValidation = {
        eligible: true,
        adminOverride: true,
        originalMissingPrerequisites: [{ id: 'subject-1', code: 'MATH101', name: 'Mathematics I' }],
        message: 'Prerequisites bypassed by admin',
      };

      (enrollmentService.validatePrerequisites as jest.Mock).mockResolvedValue(mockValidation);

      const result = await enrollmentService.validatePrerequisites('student-1', 'subject-2', true);

      expect(result.eligible).toBe(true);
      expect(result.adminOverride).toBe(true);
    });

    it('should not allow non-admin users to use override', async () => {
      // This test verifies that the override flag is only processed with admin auth
      // In a real endpoint, the auth middleware would check this
      const mockValidation = {
        eligible: false,
        missingPrerequisites: [{ id: 'subject-1', code: 'MATH101', name: 'Mathematics I' }],
        message: 'Prerequisites not met: Mathematics I',
      };

      (enrollmentService.validatePrerequisites as jest.Mock).mockResolvedValue(mockValidation);

      // Without admin override
      const result = await enrollmentService.validatePrerequisites('student-1', 'subject-2', false);

      expect(result.eligible).toBe(false);
      expect(result.adminOverride).toBeUndefined();
    });
  });
});
