import { z } from 'zod';

/**
 * Validation schema for creating a student.
 */
export const createStudentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be at most 255 characters'),
  email: z.string().email('Invalid email format'),
  gradeLevel: z
    .number()
    .int()
    .min(1, 'Grade level must be between 1 and 12')
    .max(12, 'Grade level must be between 1 and 12'),
  classId: z.string().optional(),
});

/**
 * Validation schema for updating a student.
 */
export const updateStudentSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be at most 255 characters')
    .optional(),
  gradeLevel: z
    .number()
    .int()
    .min(1, 'Grade level must be between 1 and 12')
    .max(12, 'Grade level must be between 1 and 12')
    .optional(),
  classId: z.string().nullable().optional(),
});

/**
 * Validation schema for student ID parameter.
 */
export const studentIdSchema = z.object({
  id: z.string().min(1, 'Student ID is required'),
});

/**
 * Validation schema for student list query parameters.
 */
export const studentListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().optional(),
  underEnrolled: z.enum(['true', 'false']).optional(),
});

/**
 * Validation schema for CSV import row.
 */
export const csvRowSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  gradeLevel: z.number().int().min(1).max(12),
  className: z.string().optional(),
});

/**
 * Validation schema for import confirm request.
 */
export const importConfirmSchema = z.object({
  validRows: z.array(csvRowSchema),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
export type StudentListQuery = z.infer<typeof studentListQuerySchema>;
export type CsvRowData = z.infer<typeof csvRowSchema>;
export type ImportConfirmInput = z.infer<typeof importConfirmSchema>;
