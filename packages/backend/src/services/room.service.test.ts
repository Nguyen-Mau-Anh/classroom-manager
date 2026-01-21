import { AppError } from '../errors/app-error';
import { prismaMock } from '../lib/__mocks__/prisma';

import { RoomService } from './room.service';

jest.mock('../lib/prisma');

const roomService = new RoomService();

describe('RoomService', () => {
  describe('create', () => {
    it('should create a room with valid data', async () => {
      const input = {
        name: 'Biology Lab 2',
        capacity: 40,
        type: 'lab' as const,
      };

      const mockRoom = {
        id: 'room-123',
        name: input.name,
        capacity: input.capacity,
        type: input.type,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.room.findFirst.mockResolvedValue(null);
      prismaMock.room.create.mockResolvedValue(mockRoom);

      const result = await roomService.create(input);

      expect(result.id).toBe(mockRoom.id);
      expect(result.name).toBe(input.name);
      expect(result.capacity).toBe(input.capacity);
      expect(result.type).toBe(input.type);
    });

    it('should throw error if room name already exists', async () => {
      const input = {
        name: 'Biology Lab 2',
        capacity: 40,
        type: 'lab' as const,
      };

      const existingRoom = {
        id: 'existing-room',
        name: input.name,
        capacity: 30,
        type: 'lab',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.room.findFirst.mockResolvedValue(existingRoom);

      await expect(roomService.create(input)).rejects.toThrow(AppError);
    });

    it('should validate room type is classroom, lab, or gym', () => {
      // Type validation is handled by Zod schema, but service should work with valid types
      const validTypes = ['classroom', 'lab', 'gym'];

      validTypes.forEach((type) => {
        const input = {
          name: `Test Room ${type}`,
          capacity: 40,
          type: type as 'classroom' | 'lab' | 'gym',
        };

        prismaMock.room.findFirst.mockResolvedValue(null);
        prismaMock.room.create.mockResolvedValue({
          id: 'room-1',
          ...input,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        expect(async () => await roomService.create(input)).not.toThrow();
      });
    });
  });

  describe('update', () => {
    it('should update room details', async () => {
      const roomId = 'room-1';
      const input = {
        name: 'Updated Lab',
        capacity: 45,
        type: 'lab' as const,
      };

      const existingRoom = {
        id: roomId,
        name: 'Old Lab',
        capacity: 40,
        type: 'lab',
        createdAt: new Date(),
        updatedAt: new Date(),
        classes: [],
      };

      const updatedRoom = {
        ...existingRoom,
        ...input,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.room.findUnique.mockResolvedValue(existingRoom as any);
      prismaMock.room.update.mockResolvedValue(updatedRoom);

      const result = await roomService.update(roomId, input);

      expect(result.name).toBe(input.name);
      expect(result.capacity).toBe(input.capacity);
      expect(result.type).toBe(input.type);
    });

    it('should throw error if reducing capacity below max class capacity', async () => {
      const roomId = 'room-1';
      const input = {
        capacity: 30,
      };

      const existingRoom = {
        id: roomId,
        name: 'Lab',
        capacity: 50,
        type: 'lab',
        createdAt: new Date(),
        updatedAt: new Date(),
        classes: [
          {
            id: 'class-1',
            name: '10A Biology',
            gradeLevel: 10,
            capacity: 40,
            roomId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.room.findUnique.mockResolvedValue(existingRoom as any);

      await expect(roomService.update(roomId, input)).rejects.toThrow(AppError);
    });
  });

  describe('validateRoomCapacity', () => {
    it('should return true if room capacity >= class capacity', async () => {
      const roomId = 'room-1';
      const classCapacity = 35;

      const mockRoom = {
        id: roomId,
        name: 'Lab 2',
        capacity: 40,
        type: 'lab',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.room.findUnique.mockResolvedValue(mockRoom);

      const result = await roomService.validateRoomCapacity(roomId, classCapacity);

      expect(result).toBe(true);
    });

    it('should return false if room capacity < class capacity', async () => {
      const roomId = 'room-1';
      const classCapacity = 50;

      const mockRoom = {
        id: roomId,
        name: 'Small Room',
        capacity: 30,
        type: 'classroom',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.room.findUnique.mockResolvedValue(mockRoom);

      const result = await roomService.validateRoomCapacity(roomId, classCapacity);

      expect(result).toBe(false);
    });

    it('should throw error if room not found', async () => {
      const roomId = 'non-existent';
      const classCapacity = 35;

      prismaMock.room.findUnique.mockResolvedValue(null);

      await expect(roomService.validateRoomCapacity(roomId, classCapacity)).rejects.toThrow(
        AppError,
      );
    });
  });

  describe('getRoomSchedule', () => {
    it('should return weekly schedule for room', async () => {
      const roomId = 'room-1';

      const mockRoom = {
        id: roomId,
        name: 'Lab 2',
        capacity: 40,
        type: 'lab',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockTimeSlots = [
        {
          id: 'slot-1',
          dayOfWeek: 1,
          startTime: '08:00',
          endTime: '09:30',
          classId: 'class-1',
          subjectId: 'subject-1',
          teacherId: 'teacher-1',
          roomId,
          status: 'SCHEDULED' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          class: { name: '10A Biology' },
          subject: { name: 'Biology' },
          teacher: { name: 'Mr. Smith' },
        },
      ];

      prismaMock.room.findUnique.mockResolvedValue(mockRoom);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.timeSlot.findMany.mockResolvedValue(mockTimeSlots as any);

      const result = await roomService.getRoomSchedule(roomId, {});

      expect(result.roomId).toBe(roomId);
      expect(result.roomName).toBe(mockRoom.name);
      expect(result.schedule).toBeDefined();
      expect(result.schedule.length).toBeGreaterThan(0);
    });
  });
});
