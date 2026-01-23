import { PrismaClient } from '@prisma/client';

import { prisma } from '../lib/prisma';

interface PrerequisiteValidationResult {
  eligible: boolean;
  missingPrerequisites: Array<{
    id: string;
    code: string;
    name: string;
  }>;
  message: string;
  adminOverride?: boolean;
}

export class EnrollmentService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Validate if a student has completed all prerequisites for a subject
   * @param studentId - ID of the student
   * @param subjectId - ID of the subject to enroll in
   * @param adminOverride - Admin flag to bypass prerequisite check
   * @returns Validation result with eligible flag and missing prerequisites
   */
  async validatePrerequisites(
    studentId: string,
    subjectId: string,
    adminOverride: boolean = false,
  ): Promise<PrerequisiteValidationResult> {
    // Fetch subject with prerequisites
    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId },
      include: { prerequisites: true },
    });

    if (!subject) {
      throw new Error('Subject not found');
    }

    if (!subject.isActive) {
      throw new Error('Subject is not active');
    }

    // If no prerequisites, student is eligible
    if (subject.prerequisites.length === 0) {
      return {
        eligible: true,
        missingPrerequisites: [],
        message: 'Student meets all prerequisites',
      };
    }

    // Get student's completed subjects (enrollments)
    const completedEnrollments = await this.prisma.enrollment.findMany({
      where: { studentId },
      include: { subject: true },
    });

    const completedSubjectIds = new Set(completedEnrollments.map((e) => e.subjectId));

    // Check which prerequisites are missing
    const missingPrerequisites = subject.prerequisites.filter(
      (prereq) => !completedSubjectIds.has(prereq.id),
    );

    // If admin override is enabled, allow enrollment regardless
    if (adminOverride) {
      return {
        eligible: true,
        missingPrerequisites: missingPrerequisites.map((prereq) => ({
          id: prereq.id,
          code: prereq.code,
          name: prereq.name,
        })),
        message:
          missingPrerequisites.length === 0
            ? 'Student meets all prerequisites'
            : `Prerequisites not met: ${missingPrerequisites.map((p) => p.name).join(', ')}`,
        adminOverride: true,
      };
    }

    // Check if all prerequisites are met
    const allPrerequisitesMet = missingPrerequisites.length === 0;

    return {
      eligible: allPrerequisitesMet,
      missingPrerequisites: missingPrerequisites.map((prereq) => ({
        id: prereq.id,
        code: prereq.code,
        name: prereq.name,
      })),
      message: allPrerequisitesMet
        ? 'Student meets all prerequisites'
        : `Prerequisites not met: ${missingPrerequisites.map((p) => p.name).join(', ')}`,
    };
  }
}

export const enrollmentService = new EnrollmentService(prisma);
