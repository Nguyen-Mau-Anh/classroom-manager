import { AppError } from '../errors/app-error';
import { prismaMock } from '../lib/__mocks__/prisma';

import { ClassService } from './class.service';

jest.mock('../lib/prisma');

const classService = new ClassService();

describe('ClassService', () => {
  describe('create', () => {
    it('should create a class with valid data', async () => {
      const input = {
        name: '10A Biology',
        gradeLevel: 10,
        capacity: 35,
        roomId: 'room-123',
      };

      const mockRoom = {
        id: 'room-123',
        name: 'Lab 2',
        capacity: 40,
        type: 'lab',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockClass = {
        id: 'class-xyz',
        name: input.name,
        gradeLevel: input.gradeLevel,
        capacity: input.capacity,
        roomId: input.roomId,
        createdAt: new Date(),
        updatedAt: new Date(),
        room: mockRoom,
      };

      prismaMock.room.findUnique.mockResolvedValue(mockRoom);
      prismaMock.class.findFirst.mockResolvedValue(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.class.create.mockResolvedValue(mockClass as any);

      const result = await classService.create(input);

      expect(result.id).toBe(mockClass.id);
      expect(result.name).toBe(input.name);
      expect(result.gradeLevel).toBe(input.gradeLevel);
      expect(result.capacity).toBe(input.capacity);
      expect(result.room?.name).toBe(mockRoom.name);
    });

    it('should throw error if room capacity is insufficient', async () => {
      const input = {
        name: '10A Biology',
        gradeLevel: 10,
        capacity: 50,
        roomId: 'room-123',
      };

      const mockRoom = {
        id: 'room-123',
        name: 'Small Room',
        capacity: 30,
        type: 'classroom',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.room.findUnique.mockResolvedValue(mockRoom);

      await expect(classService.create(input)).rejects.toThrow(AppError);
    });

    it('should throw error if room not found', async () => {
      const input = {
        name: '10A Biology',
        gradeLevel: 10,
        capacity: 35,
        roomId: 'non-existent',
      };

      prismaMock.room.findUnique.mockResolvedValue(null);

      await expect(classService.create(input)).rejects.toThrow(AppError);
    });

    it('should throw error if class name already exists for grade', async () => {
      const input = {
        name: '10A Biology',
        gradeLevel: 10,
        capacity: 35,
      };

      const existingClass = {
        id: 'existing-class',
        name: input.name,
        gradeLevel: input.gradeLevel,
        capacity: 30,
        roomId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.class.findFirst.mockResolvedValue(existingClass);

      await expect(classService.create(input)).rejects.toThrow(AppError);
    });
  });

  describe('isClassFull', () => {
    it('should return true when class is at capacity', async () => {
      const classId = 'class-1';

      const mockClass = {
        id: classId,
        name: '10A Biology',
        gradeLevel: 10,
        capacity: 30,
        roomId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        students: new Array(30).fill({ id: 'student', isActive: true }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.class.findUnique.mockResolvedValue(mockClass as any);

      const result = await classService.isClassFull(classId);

      expect(result).toBe(true);
    });

    it('should return false when class has available spots', async () => {
      const classId = 'class-1';

      const mockClass = {
        id: classId,
        name: '10A Biology',
        gradeLevel: 10,
        capacity: 30,
        roomId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        students: new Array(25).fill({ id: 'student', isActive: true }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.class.findUnique.mockResolvedValue(mockClass as any);

      const result = await classService.isClassFull(classId);

      expect(result).toBe(false);
    });
  });

  describe('addToWaitlist', () => {
    it('should add student to waitlist when class is full', async () => {
      const classId = 'class-1';
      const studentId = 'student-1';

      const mockClass = {
        id: classId,
        name: '10A Biology',
        gradeLevel: 10,
        capacity: 30,
        roomId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        students: new Array(30).fill({ id: 'student', isActive: true }),
      };

      const mockWaitlistEntry = {
        id: 'waitlist-1',
        classId,
        studentId,
        position: 1,
        createdAt: new Date(),
        student: {
          id: studentId,
          name: 'John Doe',
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.class.findUnique.mockResolvedValue(mockClass as any);
      prismaMock.waitlist.findFirst
        .mockResolvedValueOnce(null) // Check existing waitlist
        .mockResolvedValueOnce(null); // Get max position
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.waitlist.create.mockResolvedValue(mockWaitlistEntry as any);

      const result = await classService.addToWaitlist(classId, studentId);

      expect(result.position).toBe(1);
      expect(result.studentName).toBe('John Doe');
    });

    it('should throw error if class is not full', async () => {
      const classId = 'class-1';
      const studentId = 'student-1';

      const mockClass = {
        id: classId,
        name: '10A Biology',
        gradeLevel: 10,
        capacity: 30,
        roomId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        students: new Array(25).fill({ id: 'student', isActive: true }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.class.findUnique.mockResolvedValue(mockClass as any);

      await expect(classService.addToWaitlist(classId, studentId)).rejects.toThrow(AppError);
    });
  });

  describe('getWaitlist', () => {
    it('should return ordered waitlist for class', async () => {
      const classId = 'class-1';

      const mockClass = {
        id: classId,
        name: '10A Biology',
        gradeLevel: 10,
        capacity: 30,
        roomId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        students: new Array(30).fill({ id: 'student' }),
      };

      const mockWaitlist = [
        {
          id: 'wait-1',
          classId,
          studentId: 'student-1',
          position: 1,
          createdAt: new Date('2026-01-20'),
          student: { id: 'student-1', name: 'Alice' },
        },
        {
          id: 'wait-2',
          classId,
          studentId: 'student-2',
          position: 2,
          createdAt: new Date('2026-01-21'),
          student: { id: 'student-2', name: 'Bob' },
        },
      ];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.class.findUnique.mockResolvedValue(mockClass as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.waitlist.findMany.mockResolvedValue(mockWaitlist as any);

      const result = await classService.getWaitlist(classId);

      expect(result.isFull).toBe(true);
      expect(result.waitlistCount).toBe(2);
      expect(result.waitlist[0].position).toBe(1);
      expect(result.waitlist[0].studentName).toBe('Alice');
      expect(result.waitlist[1].position).toBe(2);
      expect(result.waitlist[1].studentName).toBe('Bob');
    });
  });
});
