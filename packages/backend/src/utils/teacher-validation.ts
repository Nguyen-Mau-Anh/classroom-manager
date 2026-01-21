import { z } from 'zod';

/**
 * Validation schema for creating a teacher.
 */
export const createTeacherSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be at most 255 characters'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  subjectIds: z.array(z.string()).optional().default([]),
});

/**
 * Validation schema for updating a teacher.
 */
export const updateTeacherSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be at most 255 characters')
    .optional(),
  phone: z.string().optional(),
  subjectIds: z.array(z.string()).optional(),
});

/**
 * Validation schema for teacher ID parameter.
 */
export const teacherIdSchema = z.object({
  id: z.string().min(1, 'Teacher ID is required'),
});

/**
 * Validation schema for teacher list query parameters.
 */
export const teacherListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional(),
});

export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;
export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>;
export type TeacherListQuery = z.infer<typeof teacherListQuerySchema>;
