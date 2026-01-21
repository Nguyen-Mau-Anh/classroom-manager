import { Prisma } from '@prisma/client';

import { AppError } from '../errors/app-error';
import { prisma } from '../lib/prisma';
import {
  CreateRoomInput,
  UpdateRoomInput,
  RoomListQuery,
  RoomScheduleQuery,
} from '../utils/room-validation';

interface ScheduleSlot {
  startTime: string;
  endTime: string;
  class: string;
  subject: string;
  teacher: string;
  status: string;
}

/**
 * Get the start of week (Monday) for a given date.
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

export class RoomService {
  /**
   * Create a new room.
   */
  async create(input: CreateRoomInput) {
    // Check for duplicate room name
    const existingRoom = await prisma.room.findFirst({
      where: {
        name: input.name,
      },
    });

    if (existingRoom) {
      throw AppError.validation('Room name already exists', [
        { field: 'name', message: 'This room name is already in use' },
      ]);
    }

    // Create room
    const room = await prisma.room.create({
      data: {
        name: input.name,
        capacity: input.capacity,
        type: input.type,
      },
    });

    return {
      id: room.id,
      name: room.name,
      capacity: room.capacity,
      type: room.type,
      createdAt: room.createdAt,
    };
  }

  /**
   * List rooms with pagination, filtering, and utilization stats.
   */
  async list(query: RoomListQuery) {
    const { page, pageSize, search, type } = query;
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: Prisma.RoomWhereInput = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (type) {
      where.type = type;
    }

    // Fetch rooms with time slots
    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          timeSlots: {
            select: {
              id: true,
              dayOfWeek: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.room.count({ where }),
    ]);

    // Calculate utilization stats
    const roomsWithStats = rooms.map((room) => {
      const bookedSlots = room.timeSlots.length;

      return {
        id: room.id,
        name: room.name,
        capacity: room.capacity,
        type: room.type,
        bookedSlots,
      };
    });

    return {
      rooms: roomsWithStats,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Get room by ID with details.
   */
  async getById(id: string) {
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        timeSlots: {
          select: { id: true },
        },
        classes: {
          select: {
            id: true,
            name: true,
            gradeLevel: true,
          },
        },
      },
    });

    if (!room) {
      throw AppError.notFound('Room not found');
    }

    return {
      id: room.id,
      name: room.name,
      capacity: room.capacity,
      type: room.type,
      bookedSlots: room.timeSlots.length,
      defaultClasses: room.classes,
    };
  }

  /**
   * Update room details.
   */
  async update(id: string, input: UpdateRoomInput) {
    // Check if room exists
    const existingRoom = await prisma.room.findUnique({
      where: { id },
      include: {
        classes: true,
      },
    });

    if (!existingRoom) {
      throw AppError.notFound('Room not found');
    }

    // If reducing capacity, ensure it doesn't go below any assigned class capacity
    if (input.capacity !== undefined) {
      const maxClassCapacity = existingRoom.classes.reduce(
        (max, classItem) => Math.max(max, classItem.capacity),
        0,
      );

      if (input.capacity < maxClassCapacity) {
        throw AppError.validation(
          `Cannot reduce room capacity below maximum assigned class capacity (${maxClassCapacity})`,
          [
            {
              field: 'capacity',
              message: `Room capacity must be at least ${maxClassCapacity}`,
            },
          ],
        );
      }
    }

    // Update room
    const updatedRoom = await prisma.room.update({
      where: { id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.capacity !== undefined && { capacity: input.capacity }),
        ...(input.type && { type: input.type }),
      },
    });

    return {
      id: updatedRoom.id,
      name: updatedRoom.name,
      capacity: updatedRoom.capacity,
      type: updatedRoom.type,
    };
  }

  /**
   * Delete room (only if not in use).
   */
  async delete(id: string) {
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        classes: true,
        timeSlots: true,
      },
    });

    if (!room) {
      throw AppError.notFound('Room not found');
    }

    // Check if room is in use
    if (room.classes.length > 0 || room.timeSlots.length > 0) {
      throw AppError.validation(
        'Cannot delete room that is assigned to classes or has scheduled time slots',
        [
          {
            field: 'id',
            message: 'Remove all class assignments and time slots before deleting',
          },
        ],
      );
    }

    // Delete room
    await prisma.room.delete({ where: { id } });
  }

  /**
   * Get room's weekly schedule.
   */
  async getRoomSchedule(roomId: string, query: RoomScheduleQuery) {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw AppError.notFound('Room not found');
    }

    // Parse week parameter or use current week
    const weekDate = query.week ? new Date(query.week) : new Date();
    const weekStart = getWeekStart(weekDate);

    // Get time slots for this room
    const timeSlots = await prisma.timeSlot.findMany({
      where: {
        roomId,
      },
      include: {
        class: {
          select: {
            name: true,
          },
        },
        subject: {
          select: {
            name: true,
          },
        },
        teacher: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    // Group time slots by day
    const schedule: {
      dayOfWeek: number;
      dayName: string;
      slots: ScheduleSlot[];
    }[] = [
      { dayOfWeek: 1, dayName: 'Monday', slots: [] },
      { dayOfWeek: 2, dayName: 'Tuesday', slots: [] },
      { dayOfWeek: 3, dayName: 'Wednesday', slots: [] },
      { dayOfWeek: 4, dayName: 'Thursday', slots: [] },
      { dayOfWeek: 5, dayName: 'Friday', slots: [] },
      { dayOfWeek: 6, dayName: 'Saturday', slots: [] },
      { dayOfWeek: 0, dayName: 'Sunday', slots: [] },
    ];

    timeSlots.forEach((slot) => {
      const daySchedule = schedule.find((d) => d.dayOfWeek === slot.dayOfWeek);
      if (daySchedule) {
        daySchedule.slots.push({
          startTime: slot.startTime,
          endTime: slot.endTime,
          class: slot.class.name,
          subject: slot.subject.name,
          teacher: slot.teacher.name,
          status: slot.status,
        });
      }
    });

    return {
      roomId,
      roomName: room.name,
      week: weekStart.toISOString().split('T')[0],
      schedule: schedule.filter(
        (day) => day.slots.length > 0 || (day.dayOfWeek >= 1 && day.dayOfWeek <= 5),
      ), // Show weekdays
    };
  }

  /**
   * Validate room capacity against class capacity.
   */
  async validateRoomCapacity(roomId: string, classCapacity: number): Promise<boolean> {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw AppError.notFound('Room not found');
    }

    return room.capacity >= classCapacity;
  }
}

export const roomService = new RoomService();
