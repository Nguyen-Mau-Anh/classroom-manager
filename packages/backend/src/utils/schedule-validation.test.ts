import {
  createTimeSlotSchema,
  updateTimeSlotSchema,
  scheduleListQuerySchema,
  getAvailableTeachersSchema,
  getAvailableRoomsSchema,
} from './schedule-validation';

describe('Schedule Validation Schemas', () => {
  describe('createTimeSlotSchema', () => {
    it('should validate valid time slot data', () => {
      const validData = {
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '09:30',
        classId: 'class-1',
        subjectId: 'subject-1',
        teacherId: 'teacher-1',
        roomId: 'room-1',
      };

      const result = createTimeSlotSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid dayOfWeek (outside 0-6)', () => {
      const invalidData = {
        dayOfWeek: 7,
        startTime: '08:00',
        endTime: '09:30',
        classId: 'class-1',
        subjectId: 'subject-1',
        teacherId: 'teacher-1',
        roomId: 'room-1',
      };

      const result = createTimeSlotSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid time format (missing leading zero)', () => {
      const invalidData = {
        dayOfWeek: 1,
        startTime: '8:00',
        endTime: '09:30',
        classId: 'class-1',
        subjectId: 'subject-1',
        teacherId: 'teacher-1',
        roomId: 'room-1',
      };

      const result = createTimeSlotSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject endTime before startTime', () => {
      const invalidData = {
        dayOfWeek: 1,
        startTime: '09:30',
        endTime: '08:00',
        classId: 'class-1',
        subjectId: 'subject-1',
        teacherId: 'teacher-1',
        roomId: 'room-1',
      };

      const result = createTimeSlotSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '09:30',
      };

      const result = createTimeSlotSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should coerce string dayOfWeek to number', () => {
      const data = {
        dayOfWeek: '1',
        startTime: '08:00',
        endTime: '09:30',
        classId: 'class-1',
        subjectId: 'subject-1',
        teacherId: 'teacher-1',
        roomId: 'room-1',
      };

      const result = createTimeSlotSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.dayOfWeek).toBe('number');
        expect(result.data.dayOfWeek).toBe(1);
      }
    });
  });

  describe('updateTimeSlotSchema', () => {
    it('should validate partial updates', () => {
      const validData = {
        endTime: '10:00',
      };

      const result = updateTimeSlotSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate status update', () => {
      const validData = {
        status: 'CANCELLED',
      };

      const result = updateTimeSlotSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid status value', () => {
      const invalidData = {
        status: 'INVALID_STATUS',
      };

      const result = updateTimeSlotSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject endTime before startTime when both provided', () => {
      const invalidData = {
        startTime: '09:30',
        endTime: '08:00',
      };

      const result = updateTimeSlotSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should allow endTime update without startTime', () => {
      const validData = {
        endTime: '10:00',
      };

      const result = updateTimeSlotSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('scheduleListQuerySchema', () => {
    it('should validate with all filters', () => {
      const validData = {
        page: 1,
        pageSize: 50,
        classId: 'class-1',
        teacherId: 'teacher-1',
        roomId: 'room-1',
        dayOfWeek: 1,
        status: 'SCHEDULED',
      };

      const result = scheduleListQuerySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should use default values for page and pageSize', () => {
      const data = {};

      const result = scheduleListQuerySchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.pageSize).toBe(100);
      }
    });

    it('should coerce string values to numbers', () => {
      const data = {
        page: '2',
        pageSize: '50',
        dayOfWeek: '3',
      };

      const result = scheduleListQuerySchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.page).toBe('number');
        expect(typeof result.data.pageSize).toBe('number');
        expect(typeof result.data.dayOfWeek).toBe('number');
      }
    });

    it('should reject invalid dayOfWeek in filter', () => {
      const invalidData = {
        dayOfWeek: 8,
      };

      const result = scheduleListQuerySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject pageSize over 1000', () => {
      const invalidData = {
        pageSize: 1001,
      };

      const result = scheduleListQuerySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('getAvailableTeachersSchema', () => {
    it('should validate valid query parameters', () => {
      const validData = {
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '09:30',
        subjectId: 'subject-1',
      };

      const result = getAvailableTeachersSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        dayOfWeek: 1,
        startTime: '08:00',
      };

      const result = getAvailableTeachersSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should coerce string dayOfWeek to number', () => {
      const data = {
        dayOfWeek: '1',
        startTime: '08:00',
        endTime: '09:30',
        subjectId: 'subject-1',
      };

      const result = getAvailableTeachersSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.dayOfWeek).toBe('number');
      }
    });
  });

  describe('getAvailableRoomsSchema', () => {
    it('should validate with required fields only', () => {
      const validData = {
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '09:30',
      };

      const result = getAvailableRoomsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate with optional classId', () => {
      const validData = {
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '09:30',
        classId: 'class-1',
      };

      const result = getAvailableRoomsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid time format', () => {
      const invalidData = {
        dayOfWeek: 1,
        startTime: '8:00',
        endTime: '09:30',
      };

      const result = getAvailableRoomsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
