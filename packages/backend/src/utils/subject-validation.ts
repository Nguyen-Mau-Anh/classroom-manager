import { z } from 'zod';

/**
 * Validation schema for creating a subject.
 */
export const createSubjectSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  code: z
    .string()
    .transform((val) => val.toUpperCase().trim())
    .pipe(
      z
        .string()
        .min(2, 'Code must be at least 2 characters')
        .max(20, 'Code must be at most 20 characters')
        .regex(/^[A-Z0-9-]+$/, 'Code must be uppercase alphanumeric with hyphens only'),
    ),
  description: z.string().max(500, 'Description must be at most 500 characters').optional(),
  isMandatory: z.boolean().optional().default(false),
  prerequisiteIds: z.array(z.string()).optional().default([]),
});

/**
 * Validation schema for updating a subject.
 */
export const updateSubjectSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .optional(),
  code: z
    .string()
    .transform((val) => val.toUpperCase().trim())
    .pipe(
      z
        .string()
        .min(2, 'Code must be at least 2 characters')
        .max(20, 'Code must be at most 20 characters')
        .regex(/^[A-Z0-9-]+$/, 'Code must be uppercase alphanumeric with hyphens only'),
    )
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .nullable()
    .optional(),
  isMandatory: z.boolean().optional(),
  prerequisiteIds: z.array(z.string()).optional(),
});

/**
 * Validation schema for subject ID parameter.
 */
export const subjectIdSchema = z.object({
  id: z.string().min(1, 'Subject ID is required'),
});

/**
 * Validation schema for subject list query parameters.
 */
export const subjectListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().optional(),
  isMandatory: z.coerce.boolean().optional(),
});

/**
 * Validation schema for assigning teachers to a subject.
 */
export const assignTeachersSchema = z.object({
  teacherIds: z
    .array(z.string().min(1, 'Teacher ID cannot be empty'))
    .min(1, 'At least one teacher ID is required'),
});

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;
export type SubjectListQuery = z.infer<typeof subjectListQuerySchema>;
export type AssignTeachersInput = z.infer<typeof assignTeachersSchema>;
