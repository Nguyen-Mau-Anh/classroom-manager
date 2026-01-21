import * as crypto from 'crypto';

import { Prisma } from '@prisma/client';
import Papa from 'papaparse';

import { AppError } from '../errors/app-error';
import { prisma } from '../lib/prisma';
import { hashPassword } from '../utils/password';
import {
  CreateStudentInput,
  UpdateStudentInput,
  StudentListQuery,
  CsvRowData,
  ImportConfirmInput,
} from '../utils/student-validation';

// Minimum required subjects (configurable)
const MIN_REQUIRED_SUBJECTS = 10;

/**
 * Generate a secure random password for student accounts.
 */
function generatePassword(): string {
  return crypto.randomBytes(12).toString('base64').slice(0, 12);
}

/**
 * Parse CSV buffer and return typed rows.
 */
function parseCSV(buffer: Buffer): Papa.ParseResult<Record<string, string>> {
  const csvText = buffer.toString('utf-8');
  return Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });
}

export class StudentService {
  /**
   * Create a new student with user account.
   */
  async create(input: CreateStudentInput) {
    // Check email uniqueness
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw AppError.validation('Email already in use', [
        { field: 'email', message: 'This email is already registered' },
      ]);
    }

    // Validate class exists and has capacity if classId provided
    if (input.classId) {
      const classRecord = await prisma.class.findUnique({
        where: { id: input.classId },
        include: { _count: { select: { students: true } } },
      });

      if (!classRecord) {
        throw AppError.validation('Class not found', [
          { field: 'classId', message: 'Selected class does not exist' },
        ]);
      }

      if (classRecord._count.students >= classRecord.capacity) {
        throw AppError.validation('Class is at full capacity', [
          { field: 'classId', message: 'Cannot assign student to full class' },
        ]);
      }
    }

    // Generate password for student user account
    const temporaryPassword = generatePassword();
    const passwordHash = await hashPassword(temporaryPassword);

    // Create user and student in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user account
      const user = await tx.user.create({
        data: {
          email: input.email,
          passwordHash,
          role: 'STUDENT',
        },
      });

      // Create student profile
      const student = await tx.student.create({
        data: {
          userId: user.id,
          name: input.name,
          gradeLevel: input.gradeLevel,
          classId: input.classId || null,
        },
      });

      // Fetch complete student with relations
      return await tx.student.findUnique({
        where: { id: student.id },
        include: {
          user: true,
          class: true,
          _count: { select: { enrollments: true } },
        },
      });
    });

    if (!result) {
      throw AppError.internal('Failed to create student');
    }

    return {
      id: result.id,
      name: result.name,
      email: result.user.email,
      gradeLevel: result.gradeLevel,
      isActive: result.isActive,
      generatedPassword: temporaryPassword,
      class: result.class ? { id: result.class.id, name: result.class.name } : null,
      enrollmentCount: result._count.enrollments,
    };
  }

  /**
   * List students with pagination, filtering, and enrollment count.
   */
  async list(query: StudentListQuery) {
    const { page, pageSize, search, underEnrolled } = query;
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: Prisma.StudentWhereInput = { isActive: true };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Fetch students with relations
    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          user: true,
          class: true,
          _count: { select: { enrollments: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.student.count({ where }),
    ]);

    // Map students with under-enrolled flag
    let studentsWithEnrollment = students.map((student) => {
      const enrollmentCount = student._count.enrollments;
      return {
        id: student.id,
        name: student.name,
        email: student.user.email,
        gradeLevel: student.gradeLevel,
        isActive: student.isActive,
        class: student.class ? { id: student.class.id, name: student.class.name } : null,
        enrollmentCount,
        isUnderEnrolled: enrollmentCount < MIN_REQUIRED_SUBJECTS,
      };
    });

    // Apply under-enrolled filter if requested
    if (underEnrolled === 'true') {
      studentsWithEnrollment = studentsWithEnrollment.filter((s) => s.isUnderEnrolled);
    }

    return {
      students: studentsWithEnrollment,
      pagination: {
        page,
        pageSize,
        total: underEnrolled === 'true' ? studentsWithEnrollment.length : total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Get student by ID with details.
   */
  async getById(id: string) {
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: true,
        class: true,
        enrollments: {
          include: {
            subject: true,
          },
        },
      },
    });

    if (!student) {
      throw AppError.notFound('Student not found');
    }

    return {
      id: student.id,
      name: student.name,
      email: student.user.email,
      gradeLevel: student.gradeLevel,
      isActive: student.isActive,
      class: student.class ? { id: student.class.id, name: student.class.name } : null,
      enrollments: student.enrollments.map((e) => ({
        id: e.id,
        subjectId: e.subjectId,
        subjectName: e.subject.name,
        subjectCode: e.subject.code,
      })),
    };
  }

  /**
   * Update student profile.
   */
  async update(id: string, input: UpdateStudentInput) {
    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id },
    });

    if (!existingStudent) {
      throw AppError.notFound('Student not found');
    }

    // Validate class exists and has capacity if classId provided
    if (input.classId !== undefined && input.classId !== null) {
      const classRecord = await prisma.class.findUnique({
        where: { id: input.classId },
        include: { _count: { select: { students: true } } },
      });

      if (!classRecord) {
        throw AppError.validation('Class not found', [
          { field: 'classId', message: 'Selected class does not exist' },
        ]);
      }

      // Check capacity only if changing to a different class
      if (
        existingStudent.classId !== input.classId &&
        classRecord._count.students >= classRecord.capacity
      ) {
        throw AppError.validation('Class is at full capacity', [
          { field: 'classId', message: 'Cannot assign student to full class' },
        ]);
      }
    }

    // Update student
    const updated = await prisma.student.update({
      where: { id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.gradeLevel !== undefined && { gradeLevel: input.gradeLevel }),
        ...(input.classId !== undefined && { classId: input.classId }),
      },
      include: {
        user: true,
        class: true,
        _count: { select: { enrollments: true } },
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      email: updated.user.email,
      gradeLevel: updated.gradeLevel,
      isActive: updated.isActive,
      class: updated.class ? { id: updated.class.id, name: updated.class.name } : null,
      enrollmentCount: updated._count.enrollments,
    };
  }

  /**
   * Soft delete student (mark as inactive).
   */
  async softDelete(id: string) {
    const student = await prisma.student.findUnique({
      where: { id },
    });

    if (!student) {
      throw AppError.notFound('Student not found');
    }

    await prisma.student.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Parse CSV file and validate data.
   */
  async parseCSV(fileBuffer: Buffer) {
    const parsed = parseCSV(fileBuffer);

    if (parsed.errors.length > 0) {
      throw AppError.validation('Invalid CSV format', [
        { field: 'file', message: 'CSV parsing failed: ' + parsed.errors[0].message },
      ]);
    }

    const validRows: Array<{ rowNumber: number; data: CsvRowData }> = [];
    const invalidRows: Array<{
      rowNumber: number;
      data: Record<string, string>;
      errors: string[];
    }> = [];

    // Get all existing emails for duplicate check
    const existingEmails = await prisma.user.findMany({
      select: { email: true },
    });
    const existingEmailSet = new Set(existingEmails.map((u) => u.email.toLowerCase()));

    // Get all classes for validation
    const classes = await prisma.class.findMany({
      select: { name: true, id: true },
    });
    const classNameMap = new Map(classes.map((c) => [c.name, c.id]));

    // Track emails within CSV for duplicate detection
    const csvEmails = new Set<string>();

    parsed.data.forEach((row, index) => {
      const rowNumber = index + 1;
      const errors: string[] = [];

      // Validate required fields
      if (!row.name || row.name.trim() === '') {
        errors.push('Name is required');
      }
      if (!row.email || row.email.trim() === '') {
        errors.push('Email is required');
      }
      if (!row.gradeLevel) {
        errors.push('Grade level is required');
      }

      const email = row.email?.trim().toLowerCase();
      const gradeLevel = parseInt(row.gradeLevel);

      // Email format validation
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Invalid email format');
      }

      // Email uniqueness check
      if (email && existingEmailSet.has(email)) {
        errors.push('Email already in use');
      }

      // Duplicate within CSV
      if (email && csvEmails.has(email)) {
        errors.push('Duplicate email in CSV');
      }

      if (email) {
        csvEmails.add(email);
      }

      // Grade level validation
      if (isNaN(gradeLevel) || gradeLevel < 1 || gradeLevel > 12) {
        errors.push('Grade level must be between 1 and 12');
      }

      // Class validation
      if (row.className && row.className.trim() !== '') {
        const className = row.className.trim();
        if (!classNameMap.has(className)) {
          errors.push(`Class '${className}' not found`);
        }
      }

      if (errors.length > 0) {
        invalidRows.push({ rowNumber, data: row, errors });
      } else {
        validRows.push({
          rowNumber,
          data: {
            name: row.name.trim(),
            email: email,
            gradeLevel,
            className: row.className?.trim(),
          },
        });
      }
    });

    return {
      validRows,
      invalidRows,
      summary: {
        total: parsed.data.length,
        valid: validRows.length,
        invalid: invalidRows.length,
      },
    };
  }

  /**
   * Bulk create students from validated CSV data.
   */
  async bulkCreate(input: ImportConfirmInput) {
    // Get class name to ID mapping
    const classes = await prisma.class.findMany({
      select: { name: true, id: true },
    });
    const classNameMap = new Map(classes.map((c) => [c.name, c.id]));

    const createdStudents = await prisma.$transaction(async (tx) => {
      const students = [];

      for (const row of input.validRows) {
        // Generate password
        const temporaryPassword = generatePassword();
        const passwordHash = await hashPassword(temporaryPassword);

        // Get classId if className provided
        const classId = row.className ? classNameMap.get(row.className) : null;

        // Create user account
        const user = await tx.user.create({
          data: {
            email: row.email,
            passwordHash,
            role: 'STUDENT',
          },
        });

        // Create student profile
        const student = await tx.student.create({
          data: {
            userId: user.id,
            name: row.name,
            gradeLevel: row.gradeLevel,
            classId: classId || null,
          },
          include: {
            user: true,
            class: true,
          },
        });

        students.push({
          id: student.id,
          name: student.name,
          email: student.user.email,
          gradeLevel: student.gradeLevel,
          class: student.class ? { id: student.class.id, name: student.class.name } : null,
        });
      }

      return students;
    });

    return {
      created: createdStudents.length,
      students: createdStudents,
    };
  }
}

export const studentService = new StudentService();
