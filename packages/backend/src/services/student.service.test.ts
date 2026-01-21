import { prismaMock } from '../lib/__mocks__/prisma';

import { StudentService } from './student.service';

jest.mock('../lib/prisma');
jest.mock('../utils/password');

const studentService = new StudentService();

describe('StudentService', () => {
  describe('create', () => {
    it('should create a student with user account and generated password', async () => {
      const input = {
        name: 'Tran Thi B',
        email: 'tranthib@school.edu',
        gradeLevel: 10,
        classId: 'class-1',
      };

      const mockClass = {
        id: 'class-1',
        name: '10A',
        gradeLevel: 10,
        capacity: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { students: 30 },
      };

      const mockUser = {
        id: 'user-1',
        email: input.email,
        passwordHash: 'hashed-password',
        role: 'STUDENT' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockStudent = {
        id: 'student-1',
        userId: mockUser.id,
        name: input.name,
        gradeLevel: input.gradeLevel,
        classId: input.classId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockStudentWithRelations = {
        ...mockStudent,
        user: mockUser,
        class: {
          id: 'class-1',
          name: '10A',
          gradeLevel: 10,
          capacity: 50,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        _count: { enrollments: 0 },
      };

      prismaMock.user.findUnique.mockResolvedValue(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.class.findUnique.mockResolvedValue(mockClass as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        return await callback(prismaMock);
      });
      prismaMock.user.create.mockResolvedValue(mockUser);
      prismaMock.student.create.mockResolvedValue(mockStudent);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.student.findUnique.mockResolvedValue(mockStudentWithRelations as any);

      const result = await studentService.create(input);

      expect(result.id).toBe(mockStudent.id);
      expect(result.name).toBe(input.name);
      expect(result.email).toBe(input.email);
      expect(result.gradeLevel).toBe(input.gradeLevel);
      expect(result.generatedPassword).toBeDefined();
      expect(typeof result.generatedPassword).toBe('string');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: input.email,
          role: 'STUDENT',
        }),
      });
    });

    it('should throw error if email already exists', async () => {
      const input = {
        name: 'Tran Thi B',
        email: 'existing@school.edu',
        gradeLevel: 10,
      };

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'existing-user',
        email: input.email,
        passwordHash: 'hash',
        role: 'STUDENT' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(studentService.create(input)).rejects.toThrow('Email already in use');
    });

    it('should throw error if class is at full capacity', async () => {
      const input = {
        name: 'Tran Thi B',
        email: 'tranthib@school.edu',
        gradeLevel: 10,
        classId: 'class-1',
      };

      const mockClass = {
        id: 'class-1',
        name: '10A',
        gradeLevel: 10,
        capacity: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { students: 50 }, // Full capacity
      };

      prismaMock.user.findUnique.mockResolvedValue(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.class.findUnique.mockResolvedValue(mockClass as any);

      await expect(studentService.create(input)).rejects.toThrow('Class is at full capacity');
    });
  });

  describe('list', () => {
    it('should list students with enrollment count and under-enrolled flag', async () => {
      const mockStudents = [
        {
          id: 'student-1',
          userId: 'user-1',
          name: 'Student A',
          gradeLevel: 10,
          classId: 'class-1',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: 'user-1',
            email: 'studenta@school.edu',
            passwordHash: 'hash',
            role: 'STUDENT' as const,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          class: {
            id: 'class-1',
            name: '10A',
            gradeLevel: 10,
            capacity: 50,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          _count: { enrollments: 8 },
        },
        {
          id: 'student-2',
          userId: 'user-2',
          name: 'Student B',
          gradeLevel: 11,
          classId: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: 'user-2',
            email: 'studentb@school.edu',
            passwordHash: 'hash',
            role: 'STUDENT' as const,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          class: null,
          _count: { enrollments: 12 },
        },
      ];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.student.findMany.mockResolvedValue(mockStudents as any);
      prismaMock.student.count.mockResolvedValue(2);

      const result = await studentService.list({ page: 1, pageSize: 20 });

      expect(result.students).toHaveLength(2);
      expect(result.students[0].isUnderEnrolled).toBe(true); // 8 < 10
      expect(result.students[1].isUnderEnrolled).toBe(false); // 12 >= 10
      expect(result.pagination.total).toBe(2);
    });

    it('should filter by under-enrolled students', async () => {
      const mockStudents = [
        {
          id: 'student-1',
          userId: 'user-1',
          name: 'Student A',
          gradeLevel: 10,
          classId: 'class-1',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: 'user-1',
            email: 'studenta@school.edu',
            passwordHash: 'hash',
            role: 'STUDENT' as const,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          class: {
            id: 'class-1',
            name: '10A',
            gradeLevel: 10,
            capacity: 50,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          _count: { enrollments: 8 },
        },
      ];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.student.findMany.mockResolvedValue(mockStudents as any);
      prismaMock.student.count.mockResolvedValue(1);

      const result = await studentService.list({ page: 1, pageSize: 20, underEnrolled: 'true' });

      expect(result.students).toHaveLength(1);
      expect(result.students[0].isUnderEnrolled).toBe(true);
    });
  });

  describe('getById', () => {
    it('should get student by ID with enrollments', async () => {
      const mockStudent = {
        id: 'student-1',
        userId: 'user-1',
        name: 'Student A',
        gradeLevel: 10,
        classId: 'class-1',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: 'user-1',
          email: 'studenta@school.edu',
          passwordHash: 'hash',
          role: 'STUDENT' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        class: {
          id: 'class-1',
          name: '10A',
          gradeLevel: 10,
          capacity: 50,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        enrollments: [
          {
            id: 'enroll-1',
            studentId: 'student-1',
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
      prismaMock.student.findUnique.mockResolvedValue(mockStudent as any);

      const result = await studentService.getById('student-1');

      expect(result.id).toBe('student-1');
      expect(result.enrollments).toHaveLength(1);
      expect(result.enrollments[0].subjectName).toBe('Mathematics');
    });

    it('should throw error if student not found', async () => {
      prismaMock.student.findUnique.mockResolvedValue(null);

      await expect(studentService.getById('nonexistent')).rejects.toThrow('Student not found');
    });
  });

  describe('update', () => {
    it('should update student profile', async () => {
      const mockExistingStudent = {
        id: 'student-1',
        userId: 'user-1',
        name: 'Old Name',
        gradeLevel: 10,
        classId: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUpdatedStudent = {
        ...mockExistingStudent,
        name: 'New Name',
        gradeLevel: 11,
        user: {
          id: 'user-1',
          email: 'student@school.edu',
          passwordHash: 'hash',
          role: 'STUDENT' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        class: null,
        _count: { enrollments: 5 },
      };

      prismaMock.student.findUnique.mockResolvedValue(mockExistingStudent);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.student.update.mockResolvedValue(mockUpdatedStudent as any);

      const result = await studentService.update('student-1', { name: 'New Name', gradeLevel: 11 });

      expect(result.name).toBe('New Name');
      expect(result.gradeLevel).toBe(11);
    });
  });

  describe('softDelete', () => {
    it('should mark student as inactive', async () => {
      const mockStudent = {
        id: 'student-1',
        userId: 'user-1',
        name: 'Student A',
        gradeLevel: 10,
        classId: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.student.findUnique.mockResolvedValue(mockStudent);
      prismaMock.student.update.mockResolvedValue({ ...mockStudent, isActive: false });

      await studentService.softDelete('student-1');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prismaMock.student.update).toHaveBeenCalledWith({
        where: { id: 'student-1' },
        data: { isActive: false },
      });
    });
  });

  describe('parseCSV', () => {
    it('should parse valid CSV and detect duplicates', async () => {
      const csvContent = `name,email,gradeLevel,className
Nguyen Van A,nguyenvana@school.edu,10,10A
Tran Thi B,duplicate@school.edu,11,11B
Le Van C,duplicate@school.edu,12,12A`;

      const buffer = Buffer.from(csvContent, 'utf-8');

      prismaMock.user.findMany.mockResolvedValue([]);
      prismaMock.class.findMany.mockResolvedValue([
        { id: 'class-1', name: '10A' },
        { id: 'class-2', name: '11B' },
        { id: 'class-3', name: '12A' },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ] as any);

      const result = await studentService.parseCSV(buffer);

      expect(result.summary.total).toBe(3);
      expect(result.summary.valid).toBe(2); // First two rows valid (second is first occurrence of duplicate@...)
      expect(result.summary.invalid).toBe(1); // Row 3 has duplicate email
      expect(result.invalidRows.some((r) => r.errors.includes('Duplicate email in CSV'))).toBe(
        true
      );
    });

    it('should validate email format', async () => {
      const csvContent = `name,email,gradeLevel,className
Nguyen Van A,invalid-email,10,10A`;

      const buffer = Buffer.from(csvContent, 'utf-8');

      prismaMock.user.findMany.mockResolvedValue([]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.class.findMany.mockResolvedValue([{ id: 'class-1', name: '10A' }] as any);

      const result = await studentService.parseCSV(buffer);

      expect(result.summary.invalid).toBe(1);
      expect(result.invalidRows[0].errors).toContain('Invalid email format');
    });

    it('should validate grade level range', async () => {
      const csvContent = `name,email,gradeLevel,className
Nguyen Van A,nguyenvana@school.edu,15,10A`;

      const buffer = Buffer.from(csvContent, 'utf-8');

      prismaMock.user.findMany.mockResolvedValue([]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.class.findMany.mockResolvedValue([{ id: 'class-1', name: '10A' }] as any);

      const result = await studentService.parseCSV(buffer);

      expect(result.summary.invalid).toBe(1);
      expect(result.invalidRows[0].errors).toContain('Grade level must be between 1 and 12');
    });

    it('should detect existing emails in database', async () => {
      const csvContent = `name,email,gradeLevel,className
Nguyen Van A,existing@school.edu,10,10A`;

      const buffer = Buffer.from(csvContent, 'utf-8');

      prismaMock.user.findMany.mockResolvedValue([
        { email: 'existing@school.edu' },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ] as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.class.findMany.mockResolvedValue([{ id: 'class-1', name: '10A' }] as any);

      const result = await studentService.parseCSV(buffer);

      expect(result.summary.invalid).toBe(1);
      expect(result.invalidRows[0].errors).toContain('Email already in use');
    });
  });

  describe('bulkCreate', () => {
    it('should create multiple students in transaction', async () => {
      const input = {
        validRows: [
          { name: 'Student A', email: 'studenta@school.edu', gradeLevel: 10, className: '10A' },
          { name: 'Student B', email: 'studentb@school.edu', gradeLevel: 11 },
        ],
      };

      prismaMock.class.findMany.mockResolvedValue([
        { id: 'class-1', name: '10A' },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ] as any);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        return await callback(prismaMock);
      });

      prismaMock.user.create
        .mockResolvedValueOnce({
          id: 'user-1',
          email: 'studenta@school.edu',
          passwordHash: 'hash',
          role: 'STUDENT' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .mockResolvedValueOnce({
          id: 'user-2',
          email: 'studentb@school.edu',
          passwordHash: 'hash',
          role: 'STUDENT' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      prismaMock.student.create
        .mockResolvedValueOnce({
          id: 'student-1',
          userId: 'user-1',
          name: 'Student A',
          gradeLevel: 10,
          classId: 'class-1',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: 'user-1',
            email: 'studenta@school.edu',
            passwordHash: 'hash',
            role: 'STUDENT' as const,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          class: {
            id: 'class-1',
            name: '10A',
            gradeLevel: 10,
            capacity: 50,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any)
        .mockResolvedValueOnce({
          id: 'student-2',
          userId: 'user-2',
          name: 'Student B',
          gradeLevel: 11,
          classId: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: 'user-2',
            email: 'studentb@school.edu',
            passwordHash: 'hash',
            role: 'STUDENT' as const,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          class: null,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);

      const result = await studentService.bulkCreate(input);

      expect(result.created).toBe(2);
      expect(result.students).toHaveLength(2);
    });
  });
});
