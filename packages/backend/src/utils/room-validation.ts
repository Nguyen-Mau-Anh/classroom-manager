import { z } from 'zod';

/**
 * Room type enum - must match exactly: classroom, lab, or gym
 */
export const RoomType = z.enum(['classroom', 'lab', 'gym']);

/**
 * Validation schema for creating a room.
 */
export const createRoomSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
  capacity: z
    .number()
    .int('Capacity must be an integer')
    .min(1, 'Capacity must be at least 1')
    .max(1000, 'Capacity must not exceed 1000'),
  type: RoomType,
});

/**
 * Validation schema for updating a room.
 */
export const updateRoomSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be at most 100 characters')
    .optional(),
  capacity: z
    .number()
    .int('Capacity must be an integer')
    .min(1, 'Capacity must be at least 1')
    .max(1000, 'Capacity must not exceed 1000')
    .optional(),
  type: RoomType.optional(),
});

/**
 * Validation schema for room ID parameter.
 */
export const roomIdSchema = z.object({
  id: z.string().min(1, 'Room ID is required'),
});

/**
 * Validation schema for room list query parameters.
 */
export const roomListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().optional(),
  type: RoomType.optional(),
});

/**
 * Validation schema for room schedule query parameters.
 */
export const roomScheduleQuerySchema = z.object({
  week: z.string().optional(), // ISO date string for the week
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type RoomListQuery = z.infer<typeof roomListQuerySchema>;
export type RoomScheduleQuery = z.infer<typeof roomScheduleQuerySchema>;
export type RoomTypeValue = z.infer<typeof RoomType>;
