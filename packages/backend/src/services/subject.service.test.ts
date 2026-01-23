import { AppError } from '../errors/app-error';
import { prismaMock } from '../lib/__mocks__/prisma';

import { SubjectService } from './subject.service';

jest.mock('../lib/prisma');

const subjectService = new SubjectService();

describe('SubjectService', () => {
  describe('create', () => {
    it('should create a subject with valid data', async () => {
      const input = {
        name: 'Advanced Biology',
        code: 'BIOL301',
        description: 'Advanced topics in cellular and molecular biology',
        isMandatory: false,
        prerequisiteIds: [],
      };

      const mockSubject = {
        id: 'subject-xyz',
        name: input.name,
        code: input.code,
        description: input.description,
        isMandatory: input.isMandatory,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        prerequisites: [],
      };

      prismaMock.subject.findUnique.mockResolvedValue(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.subject.create.mockResolvedValue(mockSubject as any);

      const result = await subjectService.create(input);

      expect(result.id).toBe(mockSubject.id);
      expect(result.name).toBe(input.name);
      expect(result.code).toBe(input.code);
      expect(result.description).toBe(input.description);
      expect(result.isMandatory).toBe(input.isMandatory);
    });

    it('should create a subject with prerequisites', async () => {
      const input = {
        name: 'Advanced Biology',
        code: 'BIOL301',
        description: 'Advanced topics in cellular and molecular biology',
        isMandatory: false,
        prerequisiteIds: ['prereq-1', 'prereq-2'],
      };

      const mockPrerequisites = [
        {
          id: 'prereq-1',
          name: 'Biology I',
          code: 'BIOL101',
          description: null,
          isMandatory: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'prereq-2',
          name: 'Chemistry I',
          code: 'CHEM101',
          description: null,
          isMandatory: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockSubject = {
        id: 'subject-xyz',
        name: input.name,
        code: input.code,
        description: input.description,
        isMandatory: input.isMandatory,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        prerequisites: mockPrerequisites,
      };

      prismaMock.subject.findUnique.mockResolvedValue(null);
      prismaMock.subject.findMany.mockResolvedValue(mockPrerequisites);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.subject.create.mockResolvedValue(mockSubject as any);

      const result = await subjectService.create(input);

      expect(result.id).toBe(mockSubject.id);
      expect(result.prerequisites).toHaveLength(2);
      expect(result.prerequisites[0].code).toBe('BIOL101');
    });

    it('should throw error if subject code already exists', async () => {
      const input = {
        name: 'Advanced Biology',
        code: 'BIOL301',
        description: 'Advanced topics',
        isMandatory: false,
        prerequisiteIds: [],
      };

      const existingSubject = {
        id: 'existing-subject',
        name: 'Biology 301',
        code: 'BIOL301',
        description: null,
        isMandatory: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.subject.findUnique.mockResolvedValue(existingSubject);

      await expect(subjectService.create(input)).rejects.toThrow(AppError);
    });

    it('should throw error if prerequisite not found', async () => {
      const input = {
        name: 'Advanced Biology',
        code: 'BIOL301',
        description: 'Advanced topics',
        isMandatory: false,
        prerequisiteIds: ['non-existent'],
      };

      prismaMock.subject.findUnique.mockResolvedValue(null);
      prismaMock.subject.findMany.mockResolvedValue([]);

      await expect(subjectService.create(input)).rejects.toThrow(AppError);
    });

    it('should throw error if circular prerequisite detected', async () => {
      const input = {
        name: 'Subject A',
        code: 'SUBA',
        description: undefined,
        isMandatory: false,
        prerequisiteIds: ['subject-b'],
      };

      const mockSubjectB = {
        id: 'subject-b',
        name: 'Subject B',
        code: 'SUBB',
        description: null,
        isMandatory: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        prerequisites: [
          {
            id: 'subject-a',
            name: 'Subject A',
            code: 'SUBA',
          },
        ],
      };

      // First call checks if subject code exists (for create)
      // Second call checks for circular prerequisites
      prismaMock.subject.findUnique
        .mockResolvedValueOnce(null)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .mockResolvedValueOnce(mockSubjectB as any);
      prismaMock.subject.findMany.mockResolvedValue([mockSubjectB]);

      await expect(subjectService.create(input)).rejects.toThrow('Circular prerequisite detected');
    });
  });

  describe('list', () => {
    it('should list subjects with pagination', async () => {
      const query = {
        page: 1,
        pageSize: 20,
      };

      const mockSubjects = [
        {
          id: 'subject-1',
          name: 'Biology I',
          code: 'BIOL101',
          description: null,
          isMandatory: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          prerequisites: [],
          qualifications: [{}, {}],
          enrollments: [{}, {}, {}],
        },
      ];

      prismaMock.subject.findMany.mockResolvedValue(mockSubjects);
      prismaMock.subject.count.mockResolvedValue(1);

      const result = await subjectService.list(query);

      expect(result.subjects).toHaveLength(1);
      expect(result.subjects[0].code).toBe('BIOL101');
      expect(result.subjects[0].prerequisiteCount).toBe(0);
      expect(result.subjects[0].qualifiedTeacherCount).toBe(2);
      expect(result.subjects[0].enrollmentCount).toBe(3);
      expect(result.pagination.total).toBe(1);
    });

    it('should filter subjects by isMandatory', async () => {
      const query = {
        page: 1,
        pageSize: 20,
        isMandatory: true,
      };

      const mockSubjects = [
        {
          id: 'subject-1',
          name: 'Biology I',
          code: 'BIOL101',
          description: null,
          isMandatory: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          prerequisites: [],
          qualifications: [],
          enrollments: [],
        },
      ];

      prismaMock.subject.findMany.mockResolvedValue(mockSubjects);
      prismaMock.subject.count.mockResolvedValue(1);

      const result = await subjectService.list(query);

      expect(result.subjects).toHaveLength(1);
      expect(result.subjects[0].isMandatory).toBe(true);
    });

    it('should search subjects by name or code', async () => {
      const query = {
        page: 1,
        pageSize: 20,
        search: 'BIOL',
      };

      const mockSubjects = [
        {
          id: 'subject-1',
          name: 'Biology I',
          code: 'BIOL101',
          description: null,
          isMandatory: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          prerequisites: [],
          qualifications: [],
          enrollments: [],
        },
      ];

      prismaMock.subject.findMany.mockResolvedValue(mockSubjects);
      prismaMock.subject.count.mockResolvedValue(1);

      const result = await subjectService.list(query);

      expect(result.subjects).toHaveLength(1);
    });
  });

  describe('getById', () => {
    it('should get subject by ID with prerequisites and teachers', async () => {
      const subjectId = 'subject-xyz';

      const mockSubject = {
        id: subjectId,
        name: 'Advanced Biology',
        code: 'BIOL301',
        description: 'Advanced topics',
        isMandatory: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        prerequisites: [
          {
            id: 'prereq-1',
            code: 'BIOL101',
            name: 'Biology I',
            prerequisites: [],
          },
        ],
        qualifications: [
          {
            teacher: {
              id: 'teacher-123',
              name: 'Dr. Tuan Nguyen',
            },
            createdAt: new Date(),
          },
        ],
        enrollments: [{}, {}],
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.subject.findUnique.mockResolvedValue(mockSubject as any);

      const result = await subjectService.getById(subjectId);

      expect(result.id).toBe(subjectId);
      expect(result.prerequisites).toHaveLength(1);
      expect(result.qualifiedTeachers).toHaveLength(1);
      expect(result.enrollmentCount).toBe(2);
    });

    it('should throw error if subject not found', async () => {
      prismaMock.subject.findUnique.mockResolvedValue(null);

      await expect(subjectService.getById('non-existent')).rejects.toThrow(AppError);
    });
  });

  describe('update', () => {
    it('should update subject details', async () => {
      const subjectId = 'subject-xyz';
      const input = {
        name: 'Updated Biology',
        description: 'Updated description',
      };

      const existingSubject = {
        id: subjectId,
        name: 'Biology',
        code: 'BIOL101',
        description: 'Old description',
        isMandatory: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedSubject = {
        ...existingSubject,
        ...input,
        prerequisites: [],
      };

      prismaMock.subject.findUnique.mockResolvedValue(existingSubject);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.subject.update.mockResolvedValue(updatedSubject as any);

      const result = await subjectService.update(subjectId, input);

      expect(result.name).toBe(input.name);
      expect(result.description).toBe(input.description);
    });

    it('should update subject prerequisites', async () => {
      const subjectId = 'subject-xyz';
      const input = {
        prerequisiteIds: ['prereq-1', 'prereq-2'],
      };

      const existingSubject = {
        id: subjectId,
        name: 'Biology',
        code: 'BIOL301',
        description: null,
        isMandatory: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockPrerequisites = [
        {
          id: 'prereq-1',
          name: 'Biology I',
          code: 'BIOL101',
          description: null,
          isMandatory: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'prereq-2',
          name: 'Chemistry I',
          code: 'CHEM101',
          description: null,
          isMandatory: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const prereq1WithPrereqs = {
        ...mockPrerequisites[0],
        prerequisites: [],
      };

      const prereq2WithPrereqs = {
        ...mockPrerequisites[1],
        prerequisites: [],
      };

      const updatedSubject = {
        ...existingSubject,
        prerequisites: mockPrerequisites.map((p) => ({
          id: p.id,
          code: p.code,
          name: p.name,
        })),
      };

      // First call: check if subject exists
      prismaMock.subject.findUnique.mockResolvedValueOnce(existingSubject);
      // Second and third calls: circular prerequisite checks
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.subject.findUnique.mockResolvedValueOnce(prereq1WithPrereqs as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.subject.findUnique.mockResolvedValueOnce(prereq2WithPrereqs as any);
      prismaMock.subject.findMany.mockResolvedValue(mockPrerequisites);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.subject.update.mockResolvedValue(updatedSubject as any);

      const result = await subjectService.update(subjectId, input);

      expect(result.prerequisites).toHaveLength(2);
    });

    it('should throw error if subject not found', async () => {
      prismaMock.subject.findUnique.mockResolvedValue(null);

      await expect(subjectService.update('non-existent', { name: 'Test' })).rejects.toThrow(
        AppError,
      );
    });
  });

  describe('delete', () => {
    it('should soft delete subject', async () => {
      const subjectId = 'subject-xyz';

      const existingSubject = {
        id: subjectId,
        name: 'Biology',
        code: 'BIOL101',
        description: null,
        isMandatory: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        timeSlots: [],
        enrollments: [],
      };

      const softDeletedSubject = {
        ...existingSubject,
        isActive: false,
      };

      prismaMock.subject.findUnique.mockResolvedValue(existingSubject);
      prismaMock.subject.update.mockResolvedValue(softDeletedSubject);

      await subjectService.delete(subjectId);

      const updateCalls = prismaMock.subject.update.mock.calls;
      expect(updateCalls[0][0]).toMatchObject({
        where: { id: subjectId },
        data: { isActive: false },
      });
    });

    it('should throw error if subject has active enrollments', async () => {
      const subjectId = 'subject-xyz';

      const existingSubject = {
        id: subjectId,
        name: 'Biology',
        code: 'BIOL101',
        description: null,
        isMandatory: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        timeSlots: [],
        enrollments: [{ id: 'enrollment-1' }],
      };

      prismaMock.subject.findUnique.mockResolvedValue(existingSubject);

      await expect(subjectService.delete(subjectId)).rejects.toThrow(
        'Cannot delete subject with active enrollments',
      );
    });

    it('should throw error if subject has scheduled time slots', async () => {
      const subjectId = 'subject-xyz';

      const existingSubject = {
        id: subjectId,
        name: 'Biology',
        code: 'BIOL101',
        description: null,
        isMandatory: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        timeSlots: [{ id: 'timeslot-1' }],
        enrollments: [],
      };

      prismaMock.subject.findUnique.mockResolvedValue(existingSubject);

      await expect(subjectService.delete(subjectId)).rejects.toThrow(
        'Cannot delete subject with scheduled time slots',
      );
    });

    it('should throw error if subject not found', async () => {
      prismaMock.subject.findUnique.mockResolvedValue(null);

      await expect(subjectService.delete('non-existent')).rejects.toThrow(AppError);
    });
  });

  describe('updateQualifiedTeachers', () => {
    it('should update qualified teachers for subject', async () => {
      const subjectId = 'subject-xyz';
      const teacherIds = ['teacher-1', 'teacher-2'];

      const existingSubject = {
        id: subjectId,
        name: 'Biology',
        code: 'BIOL101',
        description: null,
        isMandatory: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockTeachers = [
        {
          id: 'teacher-1',
          name: 'Dr. Tuan',
          phone: null,
          userId: 'user-1',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'teacher-2',
          name: 'Ms. Linh',
          phone: null,
          userId: 'user-2',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockQualifications = [
        {
          teacher: mockTeachers[0],
          createdAt: new Date(),
        },
        {
          teacher: mockTeachers[1],
          createdAt: new Date(),
        },
      ];

      prismaMock.subject.findUnique.mockResolvedValueOnce(existingSubject);
      prismaMock.teacher.findMany.mockResolvedValue(mockTeachers);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.$transaction.mockImplementation((callback: any) => callback(prismaMock));
      prismaMock.teacherQualification.deleteMany.mockResolvedValue({ count: 0 });
      prismaMock.teacherQualification.createMany.mockResolvedValue({ count: 2 });
      prismaMock.subject.findUnique.mockResolvedValueOnce({
        ...existingSubject,
        qualifications: mockQualifications,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const result = await subjectService.updateQualifiedTeachers(subjectId, teacherIds);

      expect(result.subjectId).toBe(subjectId);
      expect(result.qualifiedTeachers).toHaveLength(2);
    });

    it('should throw error if subject not found', async () => {
      prismaMock.subject.findUnique.mockResolvedValue(null);

      await expect(
        subjectService.updateQualifiedTeachers('non-existent', ['teacher-1']),
      ).rejects.toThrow(AppError);
    });

    it('should throw error if teacher not found', async () => {
      const subjectId = 'subject-xyz';
      const teacherIds = ['non-existent'];

      const existingSubject = {
        id: subjectId,
        name: 'Biology',
        code: 'BIOL101',
        description: null,
        isMandatory: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.subject.findUnique.mockResolvedValue(existingSubject);
      prismaMock.teacher.findMany.mockResolvedValue([]);

      await expect(subjectService.updateQualifiedTeachers(subjectId, teacherIds)).rejects.toThrow(
        'One or more teacher IDs not found',
      );
    });
  });

  describe('getQualifiedTeachers', () => {
    it('should get qualified teachers for subject', async () => {
      const subjectId = 'subject-xyz';

      const mockSubject = {
        id: subjectId,
        name: 'Biology',
        code: 'BIOL101',
        description: null,
        isMandatory: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        qualifications: [
          {
            teacher: {
              id: 'teacher-1',
              name: 'Dr. Tuan',
            },
            createdAt: new Date(),
          },
        ],
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.subject.findUnique.mockResolvedValue(mockSubject as any);

      const result = await subjectService.getQualifiedTeachers(subjectId);

      expect(result.subjectId).toBe(subjectId);
      expect(result.qualifiedTeachers).toHaveLength(1);
      expect(result.qualifiedTeachers[0].name).toBe('Dr. Tuan');
    });

    it('should throw error if subject not found', async () => {
      prismaMock.subject.findUnique.mockResolvedValue(null);

      await expect(subjectService.getQualifiedTeachers('non-existent')).rejects.toThrow(AppError);
    });
  });
});
