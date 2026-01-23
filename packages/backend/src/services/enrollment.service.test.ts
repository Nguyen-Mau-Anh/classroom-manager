import { PrismaClient } from '@prisma/client';

import { EnrollmentService } from './enrollment.service';

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    enrollment: {
      findMany: jest.fn(),
    },
    subject: {
      findUnique: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

describe('EnrollmentService.validatePrerequisites', () => {
  let enrollmentService: EnrollmentService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    enrollmentService = new EnrollmentService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('validatePrerequisites', () => {
    it('should return eligible=true when subject has no prerequisites', async () => {
      mockPrisma.subject.findUnique.mockResolvedValue({
        id: 'subject-1',
        name: 'Introduction to Biology',
        code: 'BIOL101',
        isActive: true,
        prerequisites: [],
      });

      const result = await enrollmentService.validatePrerequisites('student-1', 'subject-1');

      expect(result.eligible).toBe(true);
      expect(result.missingPrerequisites).toEqual([]);
      expect(mockPrisma.subject.findUnique).toHaveBeenCalledWith({
        where: { id: 'subject-1' },
        include: { prerequisites: true },
      });
    });

    it('should return eligible=true when student has completed all prerequisites', async () => {
      const prerequisite1 = { id: 'prereq-1', code: 'BIOL101', name: 'Biology I' };
      const prerequisite2 = { id: 'prereq-2', code: 'CHEM101', name: 'Chemistry I' };

      mockPrisma.subject.findUnique.mockResolvedValue({
        id: 'subject-2',
        name: 'Advanced Biology',
        code: 'BIOL301',
        isActive: true,
        prerequisites: [prerequisite1, prerequisite2],
      });

      mockPrisma.enrollment.findMany.mockResolvedValue([
        { id: 'enrollment-1', studentId: 'student-1', subjectId: 'prereq-1' },
        { id: 'enrollment-2', studentId: 'student-1', subjectId: 'prereq-2' },
      ]);

      const result = await enrollmentService.validatePrerequisites('student-1', 'subject-2');

      expect(result.eligible).toBe(true);
      expect(result.missingPrerequisites).toEqual([]);
      expect(mockPrisma.enrollment.findMany).toHaveBeenCalledWith({
        where: { studentId: 'student-1' },
        include: { subject: true },
      });
    });

    it('should return eligible=false with missing prerequisites list when student lacks some prerequisites', async () => {
      const prerequisite1 = { id: 'prereq-1', code: 'BIOL101', name: 'Biology I' };
      const prerequisite2 = { id: 'prereq-2', code: 'CHEM101', name: 'Chemistry I' };

      mockPrisma.subject.findUnique.mockResolvedValue({
        id: 'subject-2',
        name: 'Advanced Biology',
        code: 'BIOL301',
        isActive: true,
        prerequisites: [prerequisite1, prerequisite2],
      });

      mockPrisma.enrollment.findMany.mockResolvedValue([
        { id: 'enrollment-1', studentId: 'student-1', subjectId: 'prereq-1' },
      ]);

      const result = await enrollmentService.validatePrerequisites('student-1', 'subject-2');

      expect(result.eligible).toBe(false);
      expect(result.missingPrerequisites).toEqual([prerequisite2]);
      expect(result.missingPrerequisites[0].code).toBe('CHEM101');
      expect(result.missingPrerequisites[0].name).toBe('Chemistry I');
    });

    it('should return eligible=false when student has not completed any prerequisites', async () => {
      const prerequisite1 = { id: 'prereq-1', code: 'BIOL101', name: 'Biology I' };
      const prerequisite2 = { id: 'prereq-2', code: 'CHEM101', name: 'Chemistry I' };

      mockPrisma.subject.findUnique.mockResolvedValue({
        id: 'subject-2',
        name: 'Advanced Biology',
        code: 'BIOL301',
        isActive: true,
        prerequisites: [prerequisite1, prerequisite2],
      });

      mockPrisma.enrollment.findMany.mockResolvedValue([]);

      const result = await enrollmentService.validatePrerequisites('student-1', 'subject-2');

      expect(result.eligible).toBe(false);
      expect(result.missingPrerequisites).toEqual([prerequisite1, prerequisite2]);
    });

    it('should return eligible=true with adminOverride flag even when prerequisites are missing', async () => {
      const prerequisite1 = { id: 'prereq-1', code: 'BIOL101', name: 'Biology I' };

      mockPrisma.subject.findUnique.mockResolvedValue({
        id: 'subject-2',
        name: 'Advanced Biology',
        code: 'BIOL301',
        isActive: true,
        prerequisites: [prerequisite1],
      });

      mockPrisma.enrollment.findMany.mockResolvedValue([]);

      const result = await enrollmentService.validatePrerequisites(
        'student-1',
        'subject-2',
        true, // adminOverride
      );

      expect(result.eligible).toBe(true);
      expect(result.missingPrerequisites).toEqual([prerequisite1]);
      expect(result.adminOverride).toBe(true);
    });

    it('should throw error when subject does not exist', async () => {
      mockPrisma.subject.findUnique.mockResolvedValue(null);

      await expect(
        enrollmentService.validatePrerequisites('student-1', 'invalid-subject'),
      ).rejects.toThrow('Subject not found');
    });

    it('should throw error when subject is not active', async () => {
      mockPrisma.subject.findUnique.mockResolvedValue({
        id: 'subject-1',
        name: 'Old Biology',
        code: 'BIOL001',
        isActive: false,
        prerequisites: [],
      });

      await expect(
        enrollmentService.validatePrerequisites('student-1', 'subject-1'),
      ).rejects.toThrow('Subject is not active');
    });

    it('should return detailed error message with missing prerequisite names', async () => {
      const prerequisite1 = { id: 'prereq-1', code: 'BIOL101', name: 'Biology I' };
      const prerequisite2 = { id: 'prereq-2', code: 'CHEM101', name: 'Chemistry I' };

      mockPrisma.subject.findUnique.mockResolvedValue({
        id: 'subject-2',
        name: 'Advanced Biology',
        code: 'BIOL301',
        isActive: true,
        prerequisites: [prerequisite1, prerequisite2],
      });

      mockPrisma.enrollment.findMany.mockResolvedValue([]);

      const result = await enrollmentService.validatePrerequisites('student-1', 'subject-2');

      expect(result.eligible).toBe(false);
      expect(result.message).toBe('Prerequisites not met: Biology I, Chemistry I');
    });

    it('should handle single missing prerequisite in message', async () => {
      const prerequisite1 = { id: 'prereq-1', code: 'BIOL101', name: 'Biology I' };

      mockPrisma.subject.findUnique.mockResolvedValue({
        id: 'subject-2',
        name: 'Advanced Biology',
        code: 'BIOL301',
        isActive: true,
        prerequisites: [prerequisite1],
      });

      mockPrisma.enrollment.findMany.mockResolvedValue([]);

      const result = await enrollmentService.validatePrerequisites('student-1', 'subject-2');

      expect(result.eligible).toBe(false);
      expect(result.message).toBe('Prerequisites not met: Biology I');
    });

    it('should return success message when all prerequisites are met', async () => {
      const prerequisite1 = { id: 'prereq-1', code: 'BIOL101', name: 'Biology I' };

      mockPrisma.subject.findUnique.mockResolvedValue({
        id: 'subject-2',
        name: 'Advanced Biology',
        code: 'BIOL301',
        isActive: true,
        prerequisites: [prerequisite1],
      });

      mockPrisma.enrollment.findMany.mockResolvedValue([
        { id: 'enrollment-1', studentId: 'student-1', subjectId: 'prereq-1' },
      ]);

      const result = await enrollmentService.validatePrerequisites('student-1', 'subject-2');

      expect(result.eligible).toBe(true);
      expect(result.message).toBe('Student meets all prerequisites');
    });
  });
});
