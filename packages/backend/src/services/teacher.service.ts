import { Prisma } from '@prisma/client';

import { AppError } from '../errors/app-error';
import { prisma } from '../lib/prisma';
import { hashPassword } from '../utils/password';
import {
  CreateTeacherInput,
  UpdateTeacherInput,
  TeacherListQuery,
} from '../utils/teacher-validation';

/**
 * Calculate duration in hours between two time strings.
 */
function calculateDuration(startTime: string, endTime: string): number {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  return (endMinutes - startMinutes) / 60;
}

export class TeacherService {
  /**
   * Create a new teacher with user account.
   */
  async create(input: CreateTeacherInput) {
    // Check email uniqueness
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw AppError.validation('Email already in use', [
        { field: 'email', message: 'This email is already registered' },
      ]);
    }

    // Generate password for teacher user account
    const temporaryPassword = Math.random().toString(36).slice(-10);
    const passwordHash = await hashPassword(temporaryPassword);

    // Create user and teacher in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user account
      const user = await tx.user.create({
        data: {
          email: input.email,
          passwordHash,
          role: 'TEACHER',
        },
      });

      // Create teacher profile
      const teacher = await tx.teacher.create({
        data: {
          userId: user.id,
          name: input.name,
          phone: input.phone || null,
        },
      });

      // Create qualifications if provided
      if (input.subjectIds && input.subjectIds.length > 0) {
        await tx.teacherQualification.createMany({
          data: input.subjectIds.map((subjectId) => ({
            teacherId: teacher.id,
            subjectId,
          })),
        });
      }

      // Fetch complete teacher with relations
      return await tx.teacher.findUnique({
        where: { id: teacher.id },
        include: {
          user: true,
          qualifications: {
            include: {
              subject: true,
            },
          },
        },
      });
    });

    if (!result) {
      throw AppError.internal('Failed to create teacher');
    }

    return {
      id: result.id,
      name: result.name,
      email: result.user.email,
      phone: result.phone,
      isActive: result.isActive,
      qualifications: result.qualifications.map((q) => ({
        id: q.id,
        subjectId: q.subjectId,
        subjectName: q.subject.name,
        subjectCode: q.subject.code,
      })),
    };
  }

  /**
   * List teachers with pagination and workload.
   */
  async list(query: TeacherListQuery) {
    const { page, pageSize, search, isActive } = query;
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: Prisma.TeacherWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Fetch teachers with relations
    const [teachers, total] = await Promise.all([
      prisma.teacher.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          user: true,
          qualifications: {
            include: {
              subject: true,
            },
          },
          timeSlots: {
            select: {
              startTime: true,
              endTime: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.teacher.count({ where }),
    ]);

    // Calculate workload for each teacher
    const teachersWithWorkload = teachers.map((teacher) => {
      const weeklyHours = teacher.timeSlots.reduce((total, slot) => {
        return total + calculateDuration(slot.startTime, slot.endTime);
      }, 0);

      return {
        id: teacher.id,
        name: teacher.name,
        email: teacher.user.email,
        phone: teacher.phone,
        isActive: teacher.isActive,
        qualifications: teacher.qualifications.map((q) => ({
          id: q.id,
          subjectId: q.subjectId,
          subjectName: q.subject.name,
          subjectCode: q.subject.code,
        })),
        weeklyHours: Math.round(weeklyHours * 10) / 10, // Round to 1 decimal
      };
    });

    return {
      teachers: teachersWithWorkload,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Get teacher by ID with qualifications.
   */
  async getById(id: string) {
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        user: true,
        qualifications: {
          include: {
            subject: true,
          },
        },
      },
    });

    if (!teacher) {
      throw AppError.notFound('Teacher not found');
    }

    return {
      id: teacher.id,
      name: teacher.name,
      email: teacher.user.email,
      phone: teacher.phone,
      isActive: teacher.isActive,
      qualifications: teacher.qualifications.map((q) => ({
        id: q.id,
        subjectId: q.subjectId,
        subjectName: q.subject.name,
        subjectCode: q.subject.code,
      })),
    };
  }

  /**
   * Update teacher profile and qualifications.
   */
  async update(id: string, input: UpdateTeacherInput) {
    // Check if teacher exists
    const existingTeacher = await prisma.teacher.findUnique({
      where: { id },
      include: { qualifications: true },
    });

    if (!existingTeacher) {
      throw AppError.notFound('Teacher not found');
    }

    // Update teacher in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update teacher basic info
      await tx.teacher.update({
        where: { id },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.phone !== undefined && { phone: input.phone || null }),
        },
      });

      // Sync qualifications if provided
      if (input.subjectIds !== undefined) {
        // Delete existing qualifications
        await tx.teacherQualification.deleteMany({
          where: { teacherId: id },
        });

        // Create new qualifications
        if (input.subjectIds.length > 0) {
          await tx.teacherQualification.createMany({
            data: input.subjectIds.map((subjectId) => ({
              teacherId: id,
              subjectId,
            })),
          });
        }
      }

      // Fetch updated teacher with relations
      return await tx.teacher.findUnique({
        where: { id },
        include: {
          user: true,
          qualifications: {
            include: {
              subject: true,
            },
          },
        },
      });
    });

    if (!result) {
      throw AppError.internal('Failed to update teacher');
    }

    return {
      id: result.id,
      name: result.name,
      email: result.user.email,
      phone: result.phone,
      isActive: result.isActive,
      qualifications: result.qualifications.map((q) => ({
        id: q.id,
        subjectId: q.subjectId,
        subjectName: q.subject.name,
        subjectCode: q.subject.code,
      })),
    };
  }

  /**
   * Soft delete teacher (mark as inactive).
   */
  async softDelete(id: string) {
    const teacher = await prisma.teacher.findUnique({
      where: { id },
    });

    if (!teacher) {
      throw AppError.notFound('Teacher not found');
    }

    await prisma.teacher.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Calculate teacher workload.
   */
  async calculateWorkload(id: string) {
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        timeSlots: {
          select: {
            startTime: true,
            endTime: true,
          },
        },
      },
    });

    if (!teacher) {
      throw AppError.notFound('Teacher not found');
    }

    const weeklyHours = teacher.timeSlots.reduce((total, slot) => {
      return total + calculateDuration(slot.startTime, slot.endTime);
    }, 0);

    return {
      teacherId: id,
      weeklyHours: Math.round(weeklyHours * 10) / 10,
    };
  }
}

export const teacherService = new TeacherService();
