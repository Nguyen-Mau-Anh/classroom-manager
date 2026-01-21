import { z } from 'zod';

/**
 * Validation schema for creating a class.
 */
export const createClassSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
  gradeLevel: z
    .number()
    .int('Grade level must be an integer')
    .min(1, 'Grade level must be between 1 and 12')
    .max(12, 'Grade level must be between 1 and 12'),
  capacity: z
    .number()
    .int('Capacity must be an integer')
    .min(1, 'Capacity must be at least 1')
    .max(500, 'Capacity must not exceed 500'),
  roomId: z.string().optional(),
});

/**
 * Validation schema for updating a class.
 */
export const updateClassSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be at most 100 characters')
    .optional(),
  gradeLevel: z
    .number()
    .int('Grade level must be an integer')
    .min(1, 'Grade level must be between 1 and 12')
    .max(12, 'Grade level must be between 1 and 12')
    .optional(),
  capacity: z
    .number()
    .int('Capacity must be an integer')
    .min(1, 'Capacity must be at least 1')
    .max(500, 'Capacity must not exceed 500')
    .optional(),
  roomId: z.string().nullable().optional(),
});

/**
 * Validation schema for class ID parameter.
 */
export const classIdSchema = z.object({
  id: z.string().min(1, 'Class ID is required'),
});

/**
 * Validation schema for class list query parameters.
 */
export const classListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().optional(),
  gradeLevel: z.coerce.number().int().min(1).max(12).optional(),
});

export type CreateClassInput = z.infer<typeof createClassSchema>;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;
export type ClassListQuery = z.infer<typeof classListQuerySchema>;
