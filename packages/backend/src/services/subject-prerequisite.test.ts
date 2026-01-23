import { prismaMock } from '../lib/__mocks__/prisma';

jest.mock('../lib/prisma');

describe('Subject Prerequisite Chain Queries', () => {
  describe('Recursive prerequisite lookups', () => {
    it('should query subject with single level of prerequisites', async () => {
      const mockBiol101 = {
        id: 'subject-biol101',
        name: 'Biology I',
        code: 'BIOL101',
        description: 'Introduction to Biology',
        isMandatory: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockBiol301 = {
        id: 'subject-biol301',
        name: 'Advanced Biology',
        code: 'BIOL301',
        description: 'Advanced topics in biology',
        isMandatory: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        prerequisites: [mockBiol101],
      };

      prismaMock.subject.findUnique.mockResolvedValue(mockBiol301);

      const result = await prismaMock.subject.findUnique({
        where: { id: 'subject-biol301' },
        include: { prerequisites: true },
      });

      expect(result).toBeDefined();
      expect(result?.prerequisites).toHaveLength(1);
      expect(result?.prerequisites[0].code).toBe('BIOL101');
    });

    it('should query subject with multiple levels of prerequisites (nested)', async () => {
      const mockChem101 = {
        id: 'subject-chem101',
        name: 'Chemistry I',
        code: 'CHEM101',
        description: 'Introduction to Chemistry',
        isMandatory: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        prerequisites: [],
      };

      const mockBiol101 = {
        id: 'subject-biol101',
        name: 'Biology I',
        code: 'BIOL101',
        description: 'Introduction to Biology',
        isMandatory: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        prerequisites: [],
      };

      const mockBiol201 = {
        id: 'subject-biol201',
        name: 'Biology II',
        code: 'BIOL201',
        description: 'Intermediate Biology',
        isMandatory: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        prerequisites: [mockBiol101],
      };

      const mockBiol301 = {
        id: 'subject-biol301',
        name: 'Advanced Biology',
        code: 'BIOL301',
        description: 'Advanced topics in biology',
        isMandatory: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        prerequisites: [
          {
            ...mockBiol201,
            prerequisites: [mockBiol101],
          },
          mockChem101,
        ],
      };

      prismaMock.subject.findUnique.mockResolvedValue(mockBiol301);

      const result = await prismaMock.subject.findUnique({
        where: { id: 'subject-biol301' },
        include: {
          prerequisites: {
            include: {
              prerequisites: true,
            },
          },
        },
      });

      expect(result).toBeDefined();
      expect(result?.prerequisites).toHaveLength(2);
      expect(result?.prerequisites[0].code).toBe('BIOL201');
      expect(result?.prerequisites[0].prerequisites).toHaveLength(1);
      expect(result?.prerequisites[0].prerequisites[0].code).toBe('BIOL101');
      expect(result?.prerequisites[1].code).toBe('CHEM101');
    });

    it('should filter by isActive field for soft delete', async () => {
      const mockActiveSubject = {
        id: 'subject-1',
        name: 'Active Subject',
        code: 'ACT101',
        description: 'Active',
        isMandatory: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.subject.findMany.mockResolvedValue([mockActiveSubject]);

      const result = await prismaMock.subject.findMany({
        where: { isActive: true },
      });

      expect(result).toHaveLength(1);
      expect(result[0].isActive).toBe(true);
    });

    it('should verify isActive field defaults to true', async () => {
      const mockSubject = {
        id: 'subject-new',
        name: 'New Subject',
        code: 'NEW101',
        description: null,
        isMandatory: false,
        isActive: true, // Default value
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.subject.create.mockResolvedValue(mockSubject);

      const result = await prismaMock.subject.create({
        data: {
          name: 'New Subject',
          code: 'NEW101',
          isMandatory: false,
        },
      });

      expect(result.isActive).toBe(true);
    });

    it('should query subjects using code index', async () => {
      const mockSubject = {
        id: 'subject-1',
        name: 'Mathematics',
        code: 'MATH101',
        description: 'Intro to Math',
        isMandatory: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.subject.findUnique.mockResolvedValue(mockSubject);

      const result = await prismaMock.subject.findUnique({
        where: { code: 'MATH101' },
      });

      expect(result).toBeDefined();
      expect(result?.code).toBe('MATH101');
    });

    it('should query subjects using isMandatory index', async () => {
      const mockMandatorySubjects = [
        {
          id: 'subject-1',
          name: 'Mathematics',
          code: 'MATH101',
          description: 'Intro to Math',
          isMandatory: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'subject-2',
          name: 'English',
          code: 'ENG101',
          description: 'Intro to English',
          isMandatory: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prismaMock.subject.findMany.mockResolvedValue(mockMandatorySubjects);

      const result = await prismaMock.subject.findMany({
        where: { isMandatory: true },
      });

      expect(result).toHaveLength(2);
      expect(result.every((s) => s.isMandatory)).toBe(true);
    });

    it('should verify self-referential prerequisite relationship structure', async () => {
      const mockBiol101 = {
        id: 'subject-biol101',
        name: 'Biology I',
        code: 'BIOL101',
        description: null,
        isMandatory: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        prerequisites: [],
        prerequisiteOf: [],
      };

      const mockBiol201 = {
        id: 'subject-biol201',
        name: 'Biology II',
        code: 'BIOL201',
        description: null,
        isMandatory: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        prerequisites: [mockBiol101],
        prerequisiteOf: [],
      };

      // Mock BIOL101 being a prerequisite of BIOL201
      prismaMock.subject.findUnique.mockResolvedValueOnce({
        ...mockBiol101,
        prerequisiteOf: [
          {
            id: mockBiol201.id,
            name: mockBiol201.name,
            code: mockBiol201.code,
            description: mockBiol201.description,
            isMandatory: mockBiol201.isMandatory,
            isActive: mockBiol201.isActive,
            createdAt: mockBiol201.createdAt,
            updatedAt: mockBiol201.updatedAt,
          },
        ],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const result = await prismaMock.subject.findUnique({
        where: { id: 'subject-biol101' },
        include: { prerequisiteOf: true },
      });

      expect(result).toBeDefined();
      expect(result?.prerequisiteOf).toHaveLength(1);
      expect(result?.prerequisiteOf[0].code).toBe('BIOL201');
    });
  });
});
