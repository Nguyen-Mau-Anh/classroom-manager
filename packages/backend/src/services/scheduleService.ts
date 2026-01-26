import { Prisma } from '@prisma/client';

import { AppError } from '../errors/app-error';
import { prisma } from '../lib/prisma';
import {
  CreateTimeSlotInput,
  UpdateTimeSlotInput,
  ScheduleListQuery,
  GetAvailableTeachersQuery,
  GetAvailableRoomsQuery,
} from '../utils/schedule-validation';

/**
 * Service for managing time slots and schedules.
 */
export class ScheduleService {
  /**
   * Create a new time slot with validation.
   */
  async create(input: CreateTimeSlotInput) {
    // Validate that entities exist and are active
    await this.validateEntities(input);

    // Check constraints (teacher qualification, conflicts)
    await this.validateConstraints(input);

    // Create time slot
    const timeSlot = await prisma.timeSlot.create({
      data: {
        dayOfWeek: input.dayOfWeek,
        startTime: input.startTime,
        endTime: input.endTime,
        classId: input.classId,
        subjectId: input.subjectId,
        teacherId: input.teacherId,
        roomId: input.roomId,
        status: 'SCHEDULED',
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
          },
        },
        subject: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
            capacity: true,
            type: true,
          },
        },
      },
    });

    return timeSlot;
  }

  /**
   * List time slots with pagination and filtering.
   */
  async list(query: ScheduleListQuery) {
    const { page, pageSize, classId, teacherId, roomId, dayOfWeek, status } = query;
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: Prisma.TimeSlotWhereInput = {};

    if (classId) {
      where.classId = classId;
    }

    if (teacherId) {
      where.teacherId = teacherId;
    }

    if (roomId) {
      where.roomId = roomId;
    }

    if (dayOfWeek !== undefined) {
      where.dayOfWeek = dayOfWeek;
    }

    if (status) {
      where.status = status;
    }

    // Execute query with pagination
    const [timeSlots, total] = await Promise.all([
      prisma.timeSlot.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        include: {
          class: {
            select: {
              id: true,
              name: true,
            },
          },
          subject: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          teacher: {
            select: {
              id: true,
              name: true,
            },
          },
          room: {
            select: {
              id: true,
              name: true,
              capacity: true,
              type: true,
            },
          },
        },
      }),
      prisma.timeSlot.count({ where }),
    ]);

    return {
      timeSlots,
      pagination: {
        page,
        pageSize,
        total,
      },
    };
  }

  /**
   * Get time slot by ID.
   */
  async getById(id: string) {
    const timeSlot = await prisma.timeSlot.findUnique({
      where: { id },
      include: {
        class: {
          select: {
            id: true,
            name: true,
          },
        },
        subject: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
            capacity: true,
            type: true,
          },
        },
      },
    });

    if (!timeSlot) {
      throw AppError.notFound('Time slot');
    }

    return timeSlot;
  }

  /**
   * Update time slot.
   */
  async update(id: string, input: UpdateTimeSlotInput) {
    // Check if time slot exists
    const existing = await prisma.timeSlot.findUnique({
      where: { id },
    });

    if (!existing) {
      throw AppError.notFound('Time slot');
    }

    // Merge existing data with updates for validation
    const mergedData = {
      dayOfWeek: input.dayOfWeek ?? existing.dayOfWeek,
      startTime: input.startTime ?? existing.startTime,
      endTime: input.endTime ?? existing.endTime,
      classId: input.classId ?? existing.classId,
      subjectId: input.subjectId ?? existing.subjectId,
      teacherId: input.teacherId ?? existing.teacherId,
      roomId: input.roomId ?? existing.roomId,
    };

    // Validate entities if they changed
    if (
      input.classId ||
      input.subjectId ||
      input.teacherId ||
      input.roomId
    ) {
      await this.validateEntities(mergedData);
    }

    // Validate constraints with exclusion of current time slot
    if (
      input.dayOfWeek !== undefined ||
      input.startTime ||
      input.endTime ||
      input.teacherId ||
      input.roomId
    ) {
      await this.validateConstraints(mergedData, id);
    }

    // Update time slot
    const timeSlot = await prisma.timeSlot.update({
      where: { id },
      data: {
        ...(input.dayOfWeek !== undefined && { dayOfWeek: input.dayOfWeek }),
        ...(input.startTime && { startTime: input.startTime }),
        ...(input.endTime && { endTime: input.endTime }),
        ...(input.classId && { classId: input.classId }),
        ...(input.subjectId && { subjectId: input.subjectId }),
        ...(input.teacherId && { teacherId: input.teacherId }),
        ...(input.roomId && { roomId: input.roomId }),
        ...(input.status && { status: input.status }),
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
          },
        },
        subject: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
            capacity: true,
            type: true,
          },
        },
      },
    });

    return timeSlot;
  }

  /**
   * Delete time slot.
   */
  async delete(id: string) {
    // Check if time slot exists
    const existing = await prisma.timeSlot.findUnique({
      where: { id },
    });

    if (!existing) {
      throw AppError.notFound('Time slot');
    }

    // Delete time slot
    await prisma.timeSlot.delete({
      where: { id },
    });

    return { message: 'Time slot deleted successfully' };
  }

  /**
   * Validate constraints without saving.
   */
  async validateOnly(input: CreateTimeSlotInput) {
    try {
      await this.validateEntities(input);
      await this.validateConstraints(input);

      return {
        valid: true,
        message: 'Schedule is valid',
      };
    } catch (error) {
      if (error instanceof AppError) {
        return {
          valid: false,
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
          },
        };
      }
      throw error;
    }
  }

  /**
   * Get available teachers for a time slot.
   */
  async getAvailableTeachers(query: GetAvailableTeachersQuery) {
    const { dayOfWeek, startTime, endTime, subjectId } = query;

    // Get all teachers qualified for this subject
    const qualifiedTeachers = await prisma.teacher.findMany({
      where: {
        isActive: true,
        qualifications: {
          some: { subjectId },
        },
      },
      include: {
        timeSlots: {
          where: {
            dayOfWeek,
            status: 'SCHEDULED',
          },
          select: {
            id: true,
            startTime: true,
            endTime: true,
          },
        },
        qualifications: {
          where: { subjectId },
          select: {
            createdAt: true,
          },
        },
      },
    });

    // Filter out teachers with conflicting time slots
    const availableTeachers = qualifiedTeachers
      .filter((teacher) => {
        return !teacher.timeSlots.some((slot) => {
          return this.timeRangesOverlap(startTime, endTime, slot.startTime, slot.endTime);
        });
      })
      .map((teacher) => ({
        id: teacher.id,
        name: teacher.name,
        qualified: true,
        currentDayWorkload: teacher.timeSlots.length,
        qualificationDate: teacher.qualifications[0]?.createdAt,
      }))
      .sort((a, b) => a.currentDayWorkload - b.currentDayWorkload);

    return { teachers: availableTeachers };
  }

  /**
   * Get available rooms for a time slot.
   */
  async getAvailableRooms(query: GetAvailableRoomsQuery) {
    const { dayOfWeek, startTime, endTime, classId } = query;

    // Get all active rooms
    const allRooms = await prisma.room.findMany({
      where: {
        isActive: true,
      },
      include: {
        timeSlots: {
          where: {
            dayOfWeek,
            status: 'SCHEDULED',
          },
          select: {
            id: true,
            startTime: true,
            endTime: true,
          },
        },
      },
    });

    // Filter out rooms with conflicting time slots
    const availableRooms = allRooms
      .filter((room) => {
        return !room.timeSlots.some((slot) => {
          return this.timeRangesOverlap(startTime, endTime, slot.startTime, slot.endTime);
        });
      })
      .map((room) => ({
        id: room.id,
        name: room.name,
        capacity: room.capacity,
        type: room.type,
        available: true,
      }));

    // Sort by capacity if classId provided
    if (classId) {
      const classData = await prisma.class.findUnique({
        where: { id: classId },
        include: {
          _count: {
            select: { students: true },
          },
        },
      });

      const classSize = classData?._count.students || 0;

      return {
        rooms: availableRooms
          .filter((room) => room.capacity >= classSize)
          .sort((a, b) => {
            const aDiff = Math.abs(a.capacity - classSize);
            const bDiff = Math.abs(b.capacity - classSize);
            return aDiff - bDiff;
          }),
      };
    }

    return { rooms: availableRooms };
  }

  /**
   * Validate that all referenced entities exist and are active.
   */
  private async validateEntities(input: {
    classId: string;
    subjectId: string;
    teacherId: string;
    roomId: string;
  }) {
    const [classData, subject, teacher, room] = await Promise.all([
      prisma.class.findUnique({ where: { id: input.classId } }),
      prisma.subject.findUnique({ where: { id: input.subjectId } }),
      prisma.teacher.findUnique({ where: { id: input.teacherId } }),
      prisma.room.findUnique({ where: { id: input.roomId } }),
    ]);

    if (!classData || !classData.isActive) {
      throw AppError.validation('Class not found or inactive', [
        { field: 'classId', message: 'Invalid class ID' },
      ]);
    }

    if (!subject || !subject.isActive) {
      throw AppError.validation('Subject not found or inactive', [
        { field: 'subjectId', message: 'Invalid subject ID' },
      ]);
    }

    if (!teacher || !teacher.isActive) {
      throw AppError.validation('Teacher not found or inactive', [
        { field: 'teacherId', message: 'Invalid teacher ID' },
      ]);
    }

    if (!room || !room.isActive) {
      throw AppError.validation('Room not found or inactive', [
        { field: 'roomId', message: 'Invalid room ID' },
      ]);
    }
  }

  /**
   * Validate scheduling constraints.
   */
  private async validateConstraints(
    input: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      teacherId: string;
      roomId: string;
      subjectId: string;
    },
    excludeId?: string,
  ) {
    // Check teacher qualification
    const qualification = await prisma.teacherQualification.findUnique({
      where: {
        teacherId_subjectId: {
          teacherId: input.teacherId,
          subjectId: input.subjectId,
        },
      },
      include: {
        teacher: { select: { name: true } },
        subject: { select: { name: true } },
      },
    });

    if (!qualification) {
      throw AppError.validation(
        `Teacher ${qualification?.teacher.name || 'unknown'} is not qualified to teach ${qualification?.subject.name || 'this subject'}`,
        [{ field: 'teacherId', message: 'Teacher not qualified for this subject' }],
      );
    }

    // Check teacher conflicts
    const teacherConflict = await this.checkTeacherConflict(
      input.teacherId,
      input.dayOfWeek,
      input.startTime,
      input.endTime,
      excludeId,
    );

    if (teacherConflict) {
      const teacher = await prisma.teacher.findUnique({
        where: { id: input.teacherId },
        select: { name: true },
      });

      throw AppError.validation(
        `Teacher ${teacher?.name} is already assigned to ${teacherConflict.class.name} at this time`,
        [{ field: 'teacherId', message: 'Teacher already assigned at this time' }],
      );
    }

    // Check room conflicts
    const roomConflict = await this.checkRoomConflict(
      input.roomId,
      input.dayOfWeek,
      input.startTime,
      input.endTime,
      excludeId,
    );

    if (roomConflict) {
      const room = await prisma.room.findUnique({
        where: { id: input.roomId },
        select: { name: true },
      });

      throw AppError.validation(
        `Room ${room?.name} is already booked for ${roomConflict.class.name} at this time`,
        [{ field: 'roomId', message: 'Room already booked at this time' }],
      );
    }
  }

  /**
   * Check for teacher scheduling conflicts.
   */
  private async checkTeacherConflict(
    teacherId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    excludeId?: string,
  ) {
    const conflictingSlot = await prisma.timeSlot.findFirst({
      where: {
        id: excludeId ? { not: excludeId } : undefined,
        teacherId,
        dayOfWeek,
        status: 'SCHEDULED',
        OR: [
          {
            startTime: { gte: startTime, lt: endTime },
          },
          {
            endTime: { gt: startTime, lte: endTime },
          },
          {
            AND: [{ startTime: { lte: startTime } }, { endTime: { gte: endTime } }],
          },
          {
            AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }],
          },
        ],
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return conflictingSlot;
  }

  /**
   * Check for room scheduling conflicts.
   */
  private async checkRoomConflict(
    roomId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    excludeId?: string,
  ) {
    const conflictingSlot = await prisma.timeSlot.findFirst({
      where: {
        id: excludeId ? { not: excludeId } : undefined,
        roomId,
        dayOfWeek,
        status: 'SCHEDULED',
        OR: [
          {
            startTime: { gte: startTime, lt: endTime },
          },
          {
            endTime: { gt: startTime, lte: endTime },
          },
          {
            AND: [{ startTime: { lte: startTime } }, { endTime: { gte: endTime } }],
          },
          {
            AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }],
          },
        ],
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return conflictingSlot;
  }

  /**
   * Check if two time ranges overlap.
   */
  private timeRangesOverlap(
    start1: string,
    end1: string,
    start2: string,
    end2: string,
  ): boolean {
    return start1 < end2 && end1 > start2;
  }
}

export const scheduleService = new ScheduleService();
