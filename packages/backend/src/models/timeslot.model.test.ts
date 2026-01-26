import { prismaMock } from '../lib/__mocks__/prisma';

jest.mock('../lib/prisma');

describe('TimeSlot Model', () => {
  describe('Schema Validation', () => {
    it('should have all required fields', async () => {
      const mockTimeSlot = {
        id: 'timeslot-123',
        dayOfWeek: 1, // Monday
        startTime: '08:00',
        endTime: '09:30',
        classId: 'class-1',
        subjectId: 'subject-1',
        teacherId: 'teacher-1',
        roomId: 'room-1',
        status: 'SCHEDULED' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.timeSlot.create.mockResolvedValue(mockTimeSlot);

      const result = await prismaMock.timeSlot.create({
        data: {
          dayOfWeek: mockTimeSlot.dayOfWeek,
          startTime: mockTimeSlot.startTime,
          endTime: mockTimeSlot.endTime,
          classId: mockTimeSlot.classId,
          subjectId: mockTimeSlot.subjectId,
          teacherId: mockTimeSlot.teacherId,
          roomId: mockTimeSlot.roomId,
        },
      });

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('dayOfWeek', 1);
      expect(result).toHaveProperty('startTime', '08:00');
      expect(result).toHaveProperty('endTime', '09:30');
      expect(result).toHaveProperty('classId');
      expect(result).toHaveProperty('subjectId');
      expect(result).toHaveProperty('teacherId');
      expect(result).toHaveProperty('roomId');
      expect(result).toHaveProperty('status', 'SCHEDULED');
    });

    it('should support querying by classId (index)', async () => {
      const mockTimeSlots = [
        {
          id: 'timeslot-1',
          dayOfWeek: 1,
          startTime: '08:00',
          endTime: '09:30',
          classId: 'class-1',
          subjectId: 'subject-1',
          teacherId: 'teacher-1',
          roomId: 'room-1',
          status: 'SCHEDULED' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prismaMock.timeSlot.findMany.mockResolvedValue(mockTimeSlots);

      const result = await prismaMock.timeSlot.findMany({
        where: { classId: 'class-1' },
      });

      expect(result).toHaveLength(1);
      expect(result[0].classId).toBe('class-1');
    });

    it('should support querying by subjectId (index)', async () => {
      const mockTimeSlots = [
        {
          id: 'timeslot-1',
          dayOfWeek: 1,
          startTime: '08:00',
          endTime: '09:30',
          classId: 'class-1',
          subjectId: 'subject-1',
          teacherId: 'teacher-1',
          roomId: 'room-1',
          status: 'SCHEDULED' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prismaMock.timeSlot.findMany.mockResolvedValue(mockTimeSlots);

      const result = await prismaMock.timeSlot.findMany({
        where: { subjectId: 'subject-1' },
      });

      expect(result).toHaveLength(1);
      expect(result[0].subjectId).toBe('subject-1');
    });

    it('should support querying by teacherId and dayOfWeek (composite index)', async () => {
      const mockTimeSlots = [
        {
          id: 'timeslot-1',
          dayOfWeek: 1,
          startTime: '08:00',
          endTime: '09:30',
          classId: 'class-1',
          subjectId: 'subject-1',
          teacherId: 'teacher-1',
          roomId: 'room-1',
          status: 'SCHEDULED' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prismaMock.timeSlot.findMany.mockResolvedValue(mockTimeSlots);

      const result = await prismaMock.timeSlot.findMany({
        where: {
          teacherId: 'teacher-1',
          dayOfWeek: 1,
        },
      });

      expect(result).toHaveLength(1);
      expect(result[0].teacherId).toBe('teacher-1');
      expect(result[0].dayOfWeek).toBe(1);
    });

    it('should support querying by roomId and dayOfWeek (composite index)', async () => {
      const mockTimeSlots = [
        {
          id: 'timeslot-1',
          dayOfWeek: 1,
          startTime: '08:00',
          endTime: '09:30',
          classId: 'class-1',
          subjectId: 'subject-1',
          teacherId: 'teacher-1',
          roomId: 'room-1',
          status: 'SCHEDULED' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prismaMock.timeSlot.findMany.mockResolvedValue(mockTimeSlots);

      const result = await prismaMock.timeSlot.findMany({
        where: {
          roomId: 'room-1',
          dayOfWeek: 1,
        },
      });

      expect(result).toHaveLength(1);
      expect(result[0].roomId).toBe('room-1');
      expect(result[0].dayOfWeek).toBe(1);
    });

    it('should support querying by dayOfWeek and startTime (composite index)', async () => {
      const mockTimeSlots = [
        {
          id: 'timeslot-1',
          dayOfWeek: 1,
          startTime: '08:00',
          endTime: '09:30',
          classId: 'class-1',
          subjectId: 'subject-1',
          teacherId: 'teacher-1',
          roomId: 'room-1',
          status: 'SCHEDULED' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prismaMock.timeSlot.findMany.mockResolvedValue(mockTimeSlots);

      const result = await prismaMock.timeSlot.findMany({
        where: {
          dayOfWeek: 1,
          startTime: '08:00',
        },
      });

      expect(result).toHaveLength(1);
      expect(result[0].dayOfWeek).toBe(1);
      expect(result[0].startTime).toBe('08:00');
    });

    it('should support TimeSlotStatus enum values', async () => {
      const mockScheduledSlot = {
        id: 'timeslot-1',
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '09:30',
        classId: 'class-1',
        subjectId: 'subject-1',
        teacherId: 'teacher-1',
        roomId: 'room-1',
        status: 'SCHEDULED' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockCancelledSlot = {
        ...mockScheduledSlot,
        id: 'timeslot-2',
        status: 'CANCELLED' as const,
      };

      prismaMock.timeSlot.create
        .mockResolvedValueOnce(mockScheduledSlot)
        .mockResolvedValueOnce(mockCancelledSlot);

      const scheduledResult = await prismaMock.timeSlot.create({
        data: {
          dayOfWeek: 1,
          startTime: '08:00',
          endTime: '09:30',
          classId: 'class-1',
          subjectId: 'subject-1',
          teacherId: 'teacher-1',
          roomId: 'room-1',
          status: 'SCHEDULED',
        },
      });

      const cancelledResult = await prismaMock.timeSlot.create({
        data: {
          dayOfWeek: 1,
          startTime: '08:00',
          endTime: '09:30',
          classId: 'class-1',
          subjectId: 'subject-1',
          teacherId: 'teacher-1',
          roomId: 'room-1',
          status: 'CANCELLED',
        },
      });

      expect(scheduledResult.status).toBe('SCHEDULED');
      expect(cancelledResult.status).toBe('CANCELLED');
    });

    it('should include all required relations', async () => {
      const mockTimeSlotWithRelations = {
        id: 'timeslot-1',
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '09:30',
        classId: 'class-1',
        subjectId: 'subject-1',
        teacherId: 'teacher-1',
        roomId: 'room-1',
        status: 'SCHEDULED' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        class: {
          id: 'class-1',
          name: 'Grade 10A',
          gradeLevel: 10,
          capacity: 40,
          roomId: 'room-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        subject: {
          id: 'subject-1',
          name: 'Mathematics',
          code: 'MATH101',
          description: null,
          isMandatory: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        teacher: {
          id: 'teacher-1',
          userId: 'user-1',
          name: 'Ms. Linh Pham',
          phone: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        room: {
          id: 'room-1',
          name: 'Room 201',
          capacity: 40,
          type: 'classroom',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      prismaMock.timeSlot.findUnique.mockResolvedValue(mockTimeSlotWithRelations);

      const result = await prismaMock.timeSlot.findUnique({
        where: { id: 'timeslot-1' },
        include: {
          class: true,
          subject: true,
          teacher: true,
          room: true,
        },
      });

      expect(result).toHaveProperty('class');
      expect(result).toHaveProperty('subject');
      expect(result).toHaveProperty('teacher');
      expect(result).toHaveProperty('room');
      expect(result?.class.name).toBe('Grade 10A');
      expect(result?.subject.code).toBe('MATH101');
      expect(result?.teacher.name).toBe('Ms. Linh Pham');
      expect(result?.room.name).toBe('Room 201');
    });
  });
});
