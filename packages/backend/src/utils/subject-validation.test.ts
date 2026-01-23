import {
  createSubjectSchema,
  updateSubjectSchema,
  assignTeachersSchema,
  subjectListQuerySchema,
} from './subject-validation';

describe('Subject Validation Schemas', () => {
  describe('createSubjectSchema', () => {
    it('should validate valid subject data', () => {
      const validData = {
        name: 'Advanced Biology',
        code: 'BIOL301',
        description: 'Advanced topics in cellular and molecular biology',
        isMandatory: false,
        prerequisiteIds: ['subject-id-1', 'subject-id-2'],
      };

      const result = createSubjectSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Advanced Biology');
        expect(result.data.code).toBe('BIOL301');
        expect(result.data.description).toBe('Advanced topics in cellular and molecular biology');
        expect(result.data.isMandatory).toBe(false);
        expect(result.data.prerequisiteIds).toEqual(['subject-id-1', 'subject-id-2']);
      }
    });

    it('should transform code to uppercase and trim whitespace', () => {
      const data = {
        name: 'Biology',
        code: '  biol101  ',
      };

      const result = createSubjectSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.code).toBe('BIOL101');
      }
    });

    it('should apply default values for optional fields', () => {
      const minimalData = {
        name: 'Biology',
        code: 'BIOL101',
      };

      const result = createSubjectSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isMandatory).toBe(false);
        expect(result.data.prerequisiteIds).toEqual([]);
        expect(result.data.description).toBeUndefined();
      }
    });

    it('should reject name shorter than 2 characters', () => {
      const data = {
        name: 'A',
        code: 'BIOL101',
      };

      const result = createSubjectSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Name must be at least 2 characters');
      }
    });

    it('should reject name longer than 100 characters', () => {
      const data = {
        name: 'A'.repeat(101),
        code: 'BIOL101',
      };

      const result = createSubjectSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Name must be at most 100 characters');
      }
    });

    it('should reject code shorter than 2 characters', () => {
      const data = {
        name: 'Biology',
        code: 'A',
      };

      const result = createSubjectSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Code must be at least 2 characters');
      }
    });

    it('should reject code longer than 20 characters', () => {
      const data = {
        name: 'Biology',
        code: 'A'.repeat(21),
      };

      const result = createSubjectSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Code must be at most 20 characters');
      }
    });

    it('should accept and transform code with lowercase letters', () => {
      const data = {
        name: 'Biology',
        code: 'biol101',
      };

      const result = createSubjectSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.code).toBe('BIOL101');
      }
    });

    it('should reject code with special characters other than hyphens', () => {
      const data = {
        name: 'Biology',
        code: 'BIOL_101',
      };

      const result = createSubjectSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Code must be uppercase alphanumeric with hyphens only',
        );
      }
    });

    it('should accept code with hyphens', () => {
      const data = {
        name: 'Biology',
        code: 'BIOL-101',
      };

      const result = createSubjectSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.code).toBe('BIOL-101');
      }
    });

    it('should reject description longer than 500 characters', () => {
      const data = {
        name: 'Biology',
        code: 'BIOL101',
        description: 'A'.repeat(501),
      };

      const result = createSubjectSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Description must be at most 500 characters');
      }
    });

    it('should accept empty prerequisiteIds array', () => {
      const data = {
        name: 'Biology',
        code: 'BIOL101',
        prerequisiteIds: [],
      };

      const result = createSubjectSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.prerequisiteIds).toEqual([]);
      }
    });
  });

  describe('updateSubjectSchema', () => {
    it('should validate partial updates', () => {
      const partialData = {
        name: 'Updated Biology',
      };

      const result = updateSubjectSchema.safeParse(partialData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Updated Biology');
        expect(result.data.code).toBeUndefined();
        expect(result.data.description).toBeUndefined();
        expect(result.data.isMandatory).toBeUndefined();
        expect(result.data.prerequisiteIds).toBeUndefined();
      }
    });

    it('should allow updating only code', () => {
      const data = {
        code: 'BIOL102',
      };

      const result = updateSubjectSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.code).toBe('BIOL102');
      }
    });

    it('should allow updating only description', () => {
      const data = {
        description: 'Updated description',
      };

      const result = updateSubjectSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBe('Updated description');
      }
    });

    it('should allow setting description to null', () => {
      const data = {
        description: null,
      };

      const result = updateSubjectSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBeNull();
      }
    });

    it('should allow updating only isMandatory', () => {
      const data = {
        isMandatory: true,
      };

      const result = updateSubjectSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isMandatory).toBe(true);
      }
    });

    it('should allow updating only prerequisiteIds', () => {
      const data = {
        prerequisiteIds: ['subject-id-3', 'subject-id-4'],
      };

      const result = updateSubjectSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.prerequisiteIds).toEqual(['subject-id-3', 'subject-id-4']);
      }
    });

    it('should validate all fields when provided', () => {
      const fullData = {
        name: 'Updated Biology',
        code: 'BIOL102',
        description: 'Updated description',
        isMandatory: true,
        prerequisiteIds: ['subject-id-3'],
      };

      const result = updateSubjectSchema.safeParse(fullData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Updated Biology');
        expect(result.data.code).toBe('BIOL102');
        expect(result.data.description).toBe('Updated description');
        expect(result.data.isMandatory).toBe(true);
        expect(result.data.prerequisiteIds).toEqual(['subject-id-3']);
      }
    });

    it('should transform code to uppercase in updates', () => {
      const data = {
        code: '  biol102  ',
      };

      const result = updateSubjectSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.code).toBe('BIOL102');
      }
    });

    it('should reject invalid name in updates', () => {
      const data = {
        name: 'A',
      };

      const result = updateSubjectSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Name must be at least 2 characters');
      }
    });

    it('should reject invalid code with special characters in updates', () => {
      const data = {
        code: 'BIOL_102',
      };

      const result = updateSubjectSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Code must be uppercase alphanumeric with hyphens only',
        );
      }
    });

    it('should allow empty object for no updates', () => {
      const data = {};

      const result = updateSubjectSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(Object.keys(result.data).length).toBe(0);
      }
    });
  });

  describe('assignTeachersSchema', () => {
    it('should validate valid teacher IDs array', () => {
      const data = {
        teacherIds: ['teacher-1', 'teacher-2', 'teacher-3'],
      };

      const result = assignTeachersSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.teacherIds).toEqual(['teacher-1', 'teacher-2', 'teacher-3']);
      }
    });

    it('should accept single teacher ID', () => {
      const data = {
        teacherIds: ['teacher-1'],
      };

      const result = assignTeachersSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.teacherIds).toEqual(['teacher-1']);
      }
    });

    it('should reject empty teacherIds array', () => {
      const data = {
        teacherIds: [],
      };

      const result = assignTeachersSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('At least one teacher ID is required');
      }
    });

    it('should reject missing teacherIds field', () => {
      const data = {};

      const result = assignTeachersSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_type');
      }
    });

    it('should reject empty string in teacherIds', () => {
      const data = {
        teacherIds: ['teacher-1', '', 'teacher-3'],
      };

      const result = assignTeachersSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Teacher ID cannot be empty');
      }
    });

    it('should reject non-array teacherIds', () => {
      const data = {
        teacherIds: 'teacher-1',
      };

      const result = assignTeachersSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_type');
      }
    });
  });

  describe('subjectListQuerySchema', () => {
    it('should apply default values', () => {
      const data = {};

      const result = subjectListQuerySchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.pageSize).toBe(20);
        expect(result.data.search).toBeUndefined();
        expect(result.data.isMandatory).toBeUndefined();
      }
    });

    it('should validate custom page and pageSize', () => {
      const data = {
        page: 3,
        pageSize: 50,
      };

      const result = subjectListQuerySchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(3);
        expect(result.data.pageSize).toBe(50);
      }
    });

    it('should coerce string numbers to integers', () => {
      const data = {
        page: '2',
        pageSize: '30',
      };

      const result = subjectListQuerySchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.pageSize).toBe(30);
      }
    });

    it('should validate search parameter', () => {
      const data = {
        search: 'Biology',
      };

      const result = subjectListQuerySchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.search).toBe('Biology');
      }
    });

    it('should validate isMandatory filter', () => {
      const data = {
        isMandatory: true,
      };

      const result = subjectListQuerySchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isMandatory).toBe(true);
      }
    });

    it('should coerce string boolean to boolean', () => {
      const data = {
        isMandatory: 'true',
      };

      const result = subjectListQuerySchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isMandatory).toBe(true);
      }
    });

    it('should reject negative page number', () => {
      const data = {
        page: -1,
      };

      const result = subjectListQuerySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('too_small');
      }
    });

    it('should reject zero page number', () => {
      const data = {
        page: 0,
      };

      const result = subjectListQuerySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('too_small');
      }
    });

    it('should reject negative pageSize', () => {
      const data = {
        pageSize: -10,
      };

      const result = subjectListQuerySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('too_small');
      }
    });

    it('should reject pageSize over 100', () => {
      const data = {
        pageSize: 101,
      };

      const result = subjectListQuerySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('too_big');
      }
    });

    it('should reject non-integer page number', () => {
      const data = {
        page: 1.5,
      };

      const result = subjectListQuerySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_type');
      }
    });

    it('should validate all parameters together', () => {
      const data = {
        page: 2,
        pageSize: 30,
        search: 'Advanced',
        isMandatory: false,
      };

      const result = subjectListQuerySchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.pageSize).toBe(30);
        expect(result.data.search).toBe('Advanced');
        expect(result.data.isMandatory).toBe(false);
      }
    });
  });
});
