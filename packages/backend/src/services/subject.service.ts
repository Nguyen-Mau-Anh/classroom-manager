import { Prisma } from '@prisma/client';

import { AppError } from '../errors/app-error';
import { prisma } from '../lib/prisma';
import {
  CreateSubjectInput,
  UpdateSubjectInput,
  SubjectListQuery,
} from '../utils/subject-validation';

export class SubjectService {
  /**
   * Create a new subject with prerequisites.
   */
  async create(input: CreateSubjectInput) {
    // Check if subject code already exists
    const existingSubject = await prisma.subject.findUnique({
      where: { code: input.code },
    });

    if (existingSubject) {
      throw AppError.validation('Subject code already exists', [
        { field: 'code', message: 'This subject code is already in use' },
      ]);
    }

    // Validate prerequisites exist and are active
    if (input.prerequisiteIds && input.prerequisiteIds.length > 0) {
      const prerequisites = await prisma.subject.findMany({
        where: {
          id: { in: input.prerequisiteIds },
          isActive: true,
        },
      });

      if (prerequisites.length !== input.prerequisiteIds.length) {
        throw AppError.validation('One or more prerequisites not found', [
          { field: 'prerequisiteIds', message: 'Invalid prerequisite IDs' },
        ]);
      }

      // Check for circular prerequisites
      for (const prereqId of input.prerequisiteIds) {
        const hasCircular = await this.detectCircularPrerequisite(prereqId, input.code);
        if (hasCircular) {
          throw AppError.validation('Circular prerequisite detected', [
            {
              field: 'prerequisiteIds',
              message: 'Prerequisites cannot form a circular dependency',
            },
          ]);
        }
      }
    }

    // Create subject with prerequisites
    const subject = await prisma.subject.create({
      data: {
        name: input.name,
        code: input.code,
        description: input.description,
        isMandatory: input.isMandatory ?? false,
        prerequisites: input.prerequisiteIds?.length
          ? {
              connect: input.prerequisiteIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        prerequisites: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    return {
      id: subject.id,
      name: subject.name,
      code: subject.code,
      description: subject.description,
      isMandatory: subject.isMandatory,
      prerequisites: subject.prerequisites,
      createdAt: subject.createdAt,
    };
  }

  /**
   * List subjects with pagination, filtering, and counts.
   */
  async list(query: SubjectListQuery) {
    const { page, pageSize, search, isMandatory } = query;
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: Prisma.SubjectWhereInput = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isMandatory !== undefined) {
      where.isMandatory = isMandatory;
    }

    // Fetch subjects with relations
    const [subjects, total] = await Promise.all([
      prisma.subject.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          prerequisites: {
            select: { id: true },
          },
          qualifications: {
            select: { id: true },
          },
          enrollments: {
            select: { id: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.subject.count({ where }),
    ]);

    // Map to response format with counts
    const subjectsWithCounts = subjects.map((subject) => ({
      id: subject.id,
      code: subject.code,
      name: subject.name,
      isMandatory: subject.isMandatory,
      prerequisiteCount: subject.prerequisites.length,
      qualifiedTeacherCount: subject.qualifications.length,
      enrollmentCount: subject.enrollments.length,
    }));

    return {
      subjects: subjectsWithCounts,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Get subject by ID with prerequisites, teachers, and enrollment count.
   */
  async getById(id: string) {
    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        prerequisites: {
          select: {
            id: true,
            code: true,
            name: true,
            prerequisites: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
        qualifications: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        enrollments: {
          select: { id: true },
        },
      },
    });

    if (!subject) {
      throw AppError.notFound('Subject not found');
    }

    // Build prerequisite chain (flattened list of all prerequisite codes)
    const prerequisiteChain = await this.getPrerequisiteChain(id);

    return {
      id: subject.id,
      code: subject.code,
      name: subject.name,
      description: subject.description,
      isMandatory: subject.isMandatory,
      prerequisites: subject.prerequisites,
      prerequisiteChain,
      qualifiedTeachers: subject.qualifications.map((q) => ({
        id: q.teacher.id,
        name: q.teacher.name,
        qualificationDate: q.createdAt,
      })),
      enrollmentCount: subject.enrollments.length,
      createdAt: subject.createdAt,
      updatedAt: subject.updatedAt,
    };
  }

  /**
   * Update subject details and prerequisites.
   */
  async update(id: string, input: UpdateSubjectInput) {
    // Check if subject exists
    const existingSubject = await prisma.subject.findUnique({
      where: { id },
    });

    if (!existingSubject) {
      throw AppError.notFound('Subject not found');
    }

    // If updating code, check uniqueness
    if (input.code && input.code !== existingSubject.code) {
      const codeExists = await prisma.subject.findUnique({
        where: { code: input.code },
      });

      if (codeExists) {
        throw AppError.validation('Subject code already exists', [
          { field: 'code', message: 'This subject code is already in use' },
        ]);
      }
    }

    // Validate prerequisites if being updated
    if (input.prerequisiteIds) {
      const prerequisites = await prisma.subject.findMany({
        where: {
          id: { in: input.prerequisiteIds },
          isActive: true,
        },
      });

      if (prerequisites.length !== input.prerequisiteIds.length) {
        throw AppError.validation('One or more prerequisites not found', [
          { field: 'prerequisiteIds', message: 'Invalid prerequisite IDs' },
        ]);
      }

      // Check for circular prerequisites
      for (const prereqId of input.prerequisiteIds) {
        if (prereqId === id) {
          throw AppError.validation('Subject cannot be its own prerequisite', [
            { field: 'prerequisiteIds', message: 'Circular dependency detected' },
          ]);
        }

        const hasCircular = await this.detectCircularPrerequisite(prereqId, existingSubject.code);
        if (hasCircular) {
          throw AppError.validation('Circular prerequisite detected', [
            {
              field: 'prerequisiteIds',
              message: 'Prerequisites cannot form a circular dependency',
            },
          ]);
        }
      }
    }

    // Update subject
    const updatedSubject = await prisma.subject.update({
      where: { id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.code && { code: input.code }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.isMandatory !== undefined && { isMandatory: input.isMandatory }),
        ...(input.prerequisiteIds && {
          prerequisites: {
            set: input.prerequisiteIds.map((prereqId) => ({ id: prereqId })),
          },
        }),
      },
      include: {
        prerequisites: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    return {
      id: updatedSubject.id,
      name: updatedSubject.name,
      code: updatedSubject.code,
      description: updatedSubject.description,
      isMandatory: updatedSubject.isMandatory,
      prerequisites: updatedSubject.prerequisites,
      updatedAt: updatedSubject.updatedAt,
    };
  }

  /**
   * Soft delete subject (set isActive to false).
   */
  async delete(id: string) {
    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        timeSlots: {
          select: { id: true },
        },
        enrollments: {
          select: { id: true },
        },
      },
    });

    if (!subject) {
      throw AppError.notFound('Subject not found');
    }

    // Check if subject has active enrollments
    if (subject.enrollments.length > 0) {
      throw AppError.validation('Cannot delete subject with active enrollments', [
        {
          field: 'id',
          message: 'Remove all enrollments before deleting this subject',
        },
      ]);
    }

    // Check if subject has scheduled time slots
    if (subject.timeSlots.length > 0) {
      throw AppError.validation('Cannot delete subject with scheduled time slots', [
        {
          field: 'id',
          message: 'Remove all time slots before deleting this subject',
        },
      ]);
    }

    // Soft delete
    await prisma.subject.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Update qualified teachers for a subject.
   */
  async updateQualifiedTeachers(subjectId: string, teacherIds: string[]) {
    // Verify subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      throw AppError.notFound('Subject not found');
    }

    // Verify all teachers exist and are active
    const teachers = await prisma.teacher.findMany({
      where: {
        id: { in: teacherIds },
        isActive: true,
      },
    });

    if (teachers.length !== teacherIds.length) {
      throw AppError.validation('One or more teacher IDs not found', [
        { field: 'teacherIds', message: 'Invalid teacher IDs' },
      ]);
    }

    // Update qualifications atomically
    await prisma.$transaction(async (tx) => {
      // Remove existing qualifications
      await tx.teacherQualification.deleteMany({
        where: { subjectId },
      });

      // Add new qualifications
      await tx.teacherQualification.createMany({
        data: teacherIds.map((teacherId) => ({
          teacherId,
          subjectId,
        })),
      });
    });

    // Fetch updated subject with qualifications
    const updatedSubject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        qualifications: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return {
      subjectId,
      qualifiedTeachers: updatedSubject!.qualifications.map((q) => ({
        id: q.teacher.id,
        name: q.teacher.name,
      })),
    };
  }

  /**
   * Get qualified teachers for a subject.
   */
  async getQualifiedTeachers(subjectId: string) {
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        qualifications: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!subject) {
      throw AppError.notFound('Subject not found');
    }

    return {
      subjectId,
      subjectName: subject.name,
      subjectCode: subject.code,
      qualifiedTeachers: subject.qualifications.map((q) => ({
        id: q.teacher.id,
        name: q.teacher.name,
        qualificationDate: q.createdAt,
      })),
    };
  }

  /**
   * Get prerequisite chain (flattened list of all prerequisite codes).
   * Returns all prerequisite codes recursively.
   */
  private async getPrerequisiteChain(subjectId: string): Promise<string[]> {
    const visited = new Set<string>();
    const chain: string[] = [];

    const traverse = async (id: string) => {
      if (visited.has(id)) {
        return;
      }
      visited.add(id);

      const subject = await prisma.subject.findUnique({
        where: { id },
        include: {
          prerequisites: {
            select: {
              id: true,
              code: true,
            },
          },
        },
      });

      if (!subject) {
        return;
      }

      for (const prereq of subject.prerequisites) {
        chain.push(prereq.code);
        await traverse(prereq.id);
      }
    };

    await traverse(subjectId);
    return chain;
  }

  /**
   * Detect circular prerequisite dependency.
   * Returns true if adding prereqId as prerequisite would create a cycle.
   */
  private async detectCircularPrerequisite(prereqId: string, targetCode: string): Promise<boolean> {
    const visited = new Set<string>();

    const traverse = async (id: string): Promise<boolean> => {
      if (visited.has(id)) {
        return false;
      }
      visited.add(id);

      const subject = await prisma.subject.findUnique({
        where: { id },
        include: {
          prerequisites: {
            select: {
              id: true,
              code: true,
            },
          },
        },
      });

      if (!subject) {
        return false;
      }

      // Check if any prerequisite matches the target code
      for (const prereq of subject.prerequisites) {
        if (prereq.code === targetCode) {
          return true;
        }
        const hasCircular = await traverse(prereq.id);
        if (hasCircular) {
          return true;
        }
      }

      return false;
    };

    return traverse(prereqId);
  }
}

export const subjectService = new SubjectService();
