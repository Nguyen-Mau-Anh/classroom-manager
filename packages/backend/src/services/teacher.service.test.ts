import { prismaMock } from '../lib/__mocks__/prisma';

import { TeacherService } from './teacher.service';

jest.mock('../lib/prisma');
jest.mock('../utils/password');

const teacherService = new TeacherService();

describe('TeacherService', () => {
  describe('create', () => {
    it('should create a teacher with user account', async () => {
      const input = {
        name: 'John Doe',
        email: 'john@school.edu',
        phone: '+84901234567',
        subjectIds: ['subject-1', 'subject-2'],
      };

      const mockUser = {
        id: 'user-1',
        email: input.email,
        passwordHash: 'hashed-password',
        role: 'TEACHER' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockTeacher = {
        id: 'teacher-1',
        userId: mockUser.id,
        name: input.name,
        phone: input.phone,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockTeacherWithRelations = {
        ...mockTeacher,
        user: mockUser,
        qualifications: [
          {
            id: 'qual-1',
            teacherId: mockTeacher.id,
            subjectId: 'subject-1',
            createdAt: new Date(),
            subject: {
              id: 'subject-1',
              name: 'Mathematics',
              code: 'MATH',
              description: null,
              isMandatory: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        ],
      };

      prismaMock.user.findUnique.mockResolvedValue(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        return await callback(prismaMock);
      });
      prismaMock.user.create.mockResolvedValue(mockUser);
      prismaMock.teacher.create.mockResolvedValue(mockTeacher);
      prismaMock.teacherQualification.createMany.mockResolvedValue({ count: 2 });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.teacher.findUnique.mockResolvedValue(mockTeacherWithRelations as any);

      const result = await teacherService.create(input);

      expect(result.id).toBe(mockTeacher.id);
      expect(result.name).toBe(input.name);
      expect(result.email).toBe(input.email);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: input.email,
          role: 'TEACHER',
        }),
      });
    });

    it('should throw error if email already exists', async () => {
      const input = {
        name: 'John Doe',
        email: 'existing@school.edu',
        phone: '+84901234567',
        subjectIds: [],
      };

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'existing-user',
        email: input.email,
        passwordHash: 'hash',
        role: 'TEACHER' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(teacherService.create(input)).rejects.toThrow('Email already in use');
    });
  });

  describe('list', () => {
    it('should return paginated teachers with workload', async () => {
      const mockTeachers = [
        {
          id: 'teacher-1',
          userId: 'user-1',
          name: 'John Doe',
          phone: '+84901234567',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: 'user-1',
            email: 'john@school.edu',
            passwordHash: 'hash',
            role: 'TEACHER' as const,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          qualifications: [],
          timeSlots: [
            { startTime: '08:00', endTime: '09:30' },
            { startTime: '10:00', endTime: '11:30' },
          ],
        },
      ];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.teacher.findMany.mockResolvedValue(mockTeachers as any);
      prismaMock.teacher.count.mockResolvedValue(1);

      const result = await teacherService.list({ page: 1, pageSize: 20 });

      expect(result.teachers).toHaveLength(1);
      expect(result.teachers[0].weeklyHours).toBe(3.0);
      expect(result.pagination.total).toBe(1);
    });

    it('should filter by search query', async () => {
      prismaMock.teacher.findMany.mockResolvedValue([]);
      prismaMock.teacher.count.mockResolvedValue(0);

      await teacherService.list({ page: 1, pageSize: 20, search: 'john' });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prismaMock.teacher.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { name: { contains: 'john', mode: 'insensitive' } },
              { user: { email: { contains: 'john', mode: 'insensitive' } } },
            ]),
          }),
        })
      );
    });
  });

  describe('getById', () => {
    it('should return teacher with qualifications', async () => {
      const mockTeacher = {
        id: 'teacher-1',
        userId: 'user-1',
        name: 'John Doe',
        phone: '+84901234567',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: 'user-1',
          email: 'john@school.edu',
          passwordHash: 'hash',
          role: 'TEACHER' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        qualifications: [
          {
            id: 'qual-1',
            teacherId: 'teacher-1',
            subjectId: 'subject-1',
            createdAt: new Date(),
            subject: {
              id: 'subject-1',
              name: 'Mathematics',
              code: 'MATH',
              description: null,
              isMandatory: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        ],
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.teacher.findUnique.mockResolvedValue(mockTeacher as any);

      const result = await teacherService.getById('teacher-1');

      expect(result.id).toBe('teacher-1');
      expect(result.qualifications).toHaveLength(1);
    });

    it('should throw error if teacher not found', async () => {
      prismaMock.teacher.findUnique.mockResolvedValue(null);

      await expect(teacherService.getById('non-existent')).rejects.toThrow('Teacher not found');
    });
  });

  describe('update', () => {
    it('should update teacher and sync qualifications', async () => {
      const mockTeacher = {
        id: 'teacher-1',
        userId: 'user-1',
        name: 'Updated Name',
        phone: '+84999999999',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: 'user-1',
          email: 'john@school.edu',
          passwordHash: 'hash',
          role: 'TEACHER' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        qualifications: [],
      };

      const mockUpdatedTeacher = {
        ...mockTeacher,
        qualifications: [
          {
            id: 'qual-1',
            teacherId: mockTeacher.id,
            subjectId: 'subject-1',
            createdAt: new Date(),
            subject: {
              id: 'subject-1',
              name: 'Mathematics',
              code: 'MATH',
              description: null,
              isMandatory: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        ],
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.teacher.findUnique.mockResolvedValue(mockTeacher as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        return await callback(prismaMock);
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.teacher.update.mockResolvedValue(mockTeacher as any);
      prismaMock.teacherQualification.deleteMany.mockResolvedValue({ count: 0 });
      prismaMock.teacherQualification.createMany.mockResolvedValue({ count: 2 });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.teacher.findUnique.mockResolvedValue(mockUpdatedTeacher as any);

      const result = await teacherService.update('teacher-1', {
        name: 'Updated Name',
        phone: '+84999999999',
        subjectIds: ['subject-1', 'subject-2'],
      });

      expect(result.name).toBe('Updated Name');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prismaMock.teacher.update).toHaveBeenCalled();
    });

    it('should throw error if teacher not found', async () => {
      prismaMock.teacher.findUnique.mockResolvedValue(null);

      await expect(teacherService.update('non-existent', { name: 'Updated' })).rejects.toThrow(
        'Teacher not found'
      );
    });
  });

  describe('softDelete', () => {
    it('should mark teacher as inactive', async () => {
      const mockTeacher = {
        id: 'teacher-1',
        userId: 'user-1',
        name: 'John Doe',
        phone: '+84901234567',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.teacher.findUnique.mockResolvedValue(mockTeacher as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.teacher.update.mockResolvedValue({ ...mockTeacher, isActive: false } as any);

      await teacherService.softDelete('teacher-1');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prismaMock.teacher.update).toHaveBeenCalledWith({
        where: { id: 'teacher-1' },
        data: { isActive: false },
      });
    });

    it('should throw error if teacher not found', async () => {
      prismaMock.teacher.findUnique.mockResolvedValue(null);

      await expect(teacherService.softDelete('non-existent')).rejects.toThrow('Teacher not found');
    });
  });

  describe('calculateWorkload', () => {
    it('should calculate weekly hours correctly', async () => {
      const mockTeacher = {
        id: 'teacher-1',
        userId: 'user-1',
        name: 'John Doe',
        phone: '+84901234567',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        timeSlots: [
          { startTime: '08:00', endTime: '09:30' }, // 1.5 hours
          { startTime: '10:00', endTime: '11:30' }, // 1.5 hours
          { startTime: '14:00', endTime: '16:00' }, // 2 hours
        ],
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.teacher.findUnique.mockResolvedValue(mockTeacher as any);

      const result = await teacherService.calculateWorkload('teacher-1');

      expect(result.weeklyHours).toBe(5.0);
    });

    it('should return 0 if teacher has no time slots', async () => {
      const mockTeacher = {
        id: 'teacher-1',
        userId: 'user-1',
        name: 'John Doe',
        phone: '+84901234567',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        timeSlots: [],
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.teacher.findUnique.mockResolvedValue(mockTeacher as any);

      const result = await teacherService.calculateWorkload('teacher-1');

      expect(result.weeklyHours).toBe(0);
    });
  });
});
