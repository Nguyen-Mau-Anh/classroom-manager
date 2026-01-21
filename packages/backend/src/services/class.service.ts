import { Prisma } from '@prisma/client';

import { AppError } from '../errors/app-error';
import { prisma } from '../lib/prisma';
import { CreateClassInput, UpdateClassInput, ClassListQuery } from '../utils/class-validation';

export class ClassService {
  /**
   * Create a new class.
   */
  async create(input: CreateClassInput) {
    // Check if room exists (if roomId provided)
    if (input.roomId) {
      const room = await prisma.room.findUnique({
        where: { id: input.roomId },
      });

      if (!room) {
        throw AppError.notFound('Room not found');
      }

      // Validate room capacity >= class capacity
      if (room.capacity < input.capacity) {
        throw AppError.validation(
          `Room capacity (${room.capacity}) insufficient for class capacity (${input.capacity})`,
          [{ field: 'roomId', message: `Room capacity must be at least ${input.capacity}` }],
        );
      }
    }

    // Check for duplicate class name at the same grade level
    const existingClass = await prisma.class.findFirst({
      where: {
        name: input.name,
        gradeLevel: input.gradeLevel,
      },
    });

    if (existingClass) {
      throw AppError.validation('Class name already exists for this grade level', [
        { field: 'name', message: 'This class name is already used for this grade' },
      ]);
    }

    // Create class
    const classData = await prisma.class.create({
      data: {
        name: input.name,
        gradeLevel: input.gradeLevel,
        capacity: input.capacity,
        roomId: input.roomId || null,
      },
      include: {
        room: true,
      },
    });

    return {
      id: classData.id,
      name: classData.name,
      gradeLevel: classData.gradeLevel,
      capacity: classData.capacity,
      roomId: classData.roomId,
      room: classData.room
        ? {
            id: classData.room.id,
            name: classData.room.name,
            capacity: classData.room.capacity,
            type: classData.room.type,
          }
        : null,
      createdAt: classData.createdAt,
    };
  }

  /**
   * List classes with pagination, filtering, and enrollment stats.
   */
  async list(query: ClassListQuery) {
    const { page, pageSize, search, gradeLevel } = query;
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: Prisma.ClassWhereInput = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (gradeLevel !== undefined) {
      where.gradeLevel = gradeLevel;
    }

    // Fetch classes with relations
    const [classes, total] = await Promise.all([
      prisma.class.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          room: true,
          students: {
            where: { isActive: true },
            select: { id: true },
          },
          waitlists: {
            select: { id: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.class.count({ where }),
    ]);

    // Calculate enrollment stats
    const classesWithStats = classes.map((classItem) => {
      const enrollmentCount = classItem.students.length;
      const enrollmentPercentage = Math.round((enrollmentCount / classItem.capacity) * 100);
      const waitlistCount = classItem.waitlists.length;

      return {
        id: classItem.id,
        name: classItem.name,
        gradeLevel: classItem.gradeLevel,
        capacity: classItem.capacity,
        enrollmentCount,
        enrollmentPercentage,
        waitlistCount,
        room: classItem.room
          ? {
              id: classItem.room.id,
              name: classItem.room.name,
            }
          : null,
      };
    });

    return {
      classes: classesWithStats,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Get class by ID with students and waitlist.
   */
  async getById(id: string) {
    const classData = await prisma.class.findUnique({
      where: { id },
      include: {
        room: true,
        students: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            gradeLevel: true,
          },
        },
        waitlists: {
          select: { id: true },
        },
      },
    });

    if (!classData) {
      throw AppError.notFound('Class not found');
    }

    const enrollmentCount = classData.students.length;
    const waitlistCount = classData.waitlists.length;

    return {
      id: classData.id,
      name: classData.name,
      gradeLevel: classData.gradeLevel,
      capacity: classData.capacity,
      enrollmentCount,
      waitlistCount,
      room: classData.room
        ? {
            id: classData.room.id,
            name: classData.room.name,
            capacity: classData.room.capacity,
            type: classData.room.type,
          }
        : null,
      students: classData.students,
    };
  }

  /**
   * Update class details.
   */
  async update(id: string, input: UpdateClassInput) {
    // Check if class exists
    const existingClass = await prisma.class.findUnique({
      where: { id },
      include: {
        students: {
          where: { isActive: true },
        },
      },
    });

    if (!existingClass) {
      throw AppError.notFound('Class not found');
    }

    // If updating roomId, validate room exists and has sufficient capacity
    if (input.roomId !== undefined && input.roomId !== null) {
      const room = await prisma.room.findUnique({
        where: { id: input.roomId },
      });

      if (!room) {
        throw AppError.notFound('Room not found');
      }

      const finalCapacity = input.capacity ?? existingClass.capacity;
      if (room.capacity < finalCapacity) {
        throw AppError.validation(
          `Room capacity (${room.capacity}) insufficient for class capacity (${finalCapacity})`,
          [{ field: 'roomId', message: `Room capacity must be at least ${finalCapacity}` }],
        );
      }
    }

    // If reducing capacity, ensure it doesn't go below current enrollment
    if (input.capacity !== undefined) {
      const currentEnrollment = existingClass.students.length;
      if (input.capacity < currentEnrollment) {
        throw AppError.validation(
          `Cannot reduce capacity below current enrollment (${currentEnrollment})`,
          [{ field: 'capacity', message: `Capacity must be at least ${currentEnrollment}` }],
        );
      }
    }

    // Update class
    const updatedClass = await prisma.class.update({
      where: { id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.gradeLevel !== undefined && { gradeLevel: input.gradeLevel }),
        ...(input.capacity !== undefined && { capacity: input.capacity }),
        ...(input.roomId !== undefined && { roomId: input.roomId }),
      },
      include: {
        room: true,
      },
    });

    return {
      id: updatedClass.id,
      name: updatedClass.name,
      gradeLevel: updatedClass.gradeLevel,
      capacity: updatedClass.capacity,
      roomId: updatedClass.roomId,
      room: updatedClass.room
        ? {
            id: updatedClass.room.id,
            name: updatedClass.room.name,
            capacity: updatedClass.room.capacity,
            type: updatedClass.room.type,
          }
        : null,
    };
  }

  /**
   * Soft delete class (prevent further enrollment, but preserve data).
   * Note: We don't have isActive on Class model yet, so this is a placeholder.
   * For now, we'll just check if it can be deleted.
   */
  async delete(id: string) {
    const classData = await prisma.class.findUnique({
      where: { id },
      include: {
        students: {
          where: { isActive: true },
        },
        timeSlots: true,
      },
    });

    if (!classData) {
      throw AppError.notFound('Class not found');
    }

    // Check if class has active students or scheduled time slots
    if (classData.students.length > 0 || classData.timeSlots.length > 0) {
      throw AppError.validation(
        'Cannot delete class with active students or scheduled time slots',
        [
          {
            field: 'id',
            message: 'Remove all students and time slots before deleting',
          },
        ],
      );
    }

    // Delete class and related waitlists
    await prisma.$transaction([
      prisma.waitlist.deleteMany({ where: { classId: id } }),
      prisma.class.delete({ where: { id } }),
    ]);
  }

  /**
   * Check if class is full.
   */
  async isClassFull(classId: string): Promise<boolean> {
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        students: {
          where: { isActive: true },
        },
      },
    });

    if (!classData) {
      throw AppError.notFound('Class not found');
    }

    return classData.students.length >= classData.capacity;
  }

  /**
   * Add student to waitlist when class is full.
   */
  async addToWaitlist(classId: string, studentId: string) {
    // Verify class exists and is full
    const isFull = await this.isClassFull(classId);
    if (!isFull) {
      throw AppError.validation('Class is not full, student can enroll directly', [
        { field: 'classId', message: 'Cannot add to waitlist when class has available spots' },
      ]);
    }

    // Check if student already on waitlist
    const existingWaitlist = await prisma.waitlist.findFirst({
      where: {
        classId,
        studentId,
      },
    });

    if (existingWaitlist) {
      throw AppError.validation('Student already on waitlist', [
        { field: 'studentId', message: 'Student is already waiting for this class' },
      ]);
    }

    // Get next position
    const maxPosition = await prisma.waitlist.findFirst({
      where: { classId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const nextPosition = (maxPosition?.position ?? 0) + 1;

    // Create waitlist entry
    const waitlistEntry = await prisma.waitlist.create({
      data: {
        classId,
        studentId,
        position: nextPosition,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      id: waitlistEntry.id,
      classId: waitlistEntry.classId,
      studentId: waitlistEntry.studentId,
      studentName: waitlistEntry.student.name,
      position: waitlistEntry.position,
      createdAt: waitlistEntry.createdAt,
    };
  }

  /**
   * Get waitlist for a class (ordered by position).
   */
  async getWaitlist(classId: string) {
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        students: {
          where: { isActive: true },
          select: { id: true },
        },
      },
    });

    if (!classData) {
      throw AppError.notFound('Class not found');
    }

    const waitlist = await prisma.waitlist.findMany({
      where: { classId },
      orderBy: { position: 'asc' },
      include: {
        student: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const enrollmentCount = classData.students.length;
    const isFull = enrollmentCount >= classData.capacity;

    return {
      classId,
      className: classData.name,
      capacity: classData.capacity,
      enrolled: enrollmentCount,
      isFull,
      waitlistCount: waitlist.length,
      waitlist: waitlist.map((entry) => ({
        position: entry.position,
        studentId: entry.studentId,
        studentName: entry.student.name,
        joinedAt: entry.createdAt,
      })),
    };
  }
}

export const classService = new ClassService();
