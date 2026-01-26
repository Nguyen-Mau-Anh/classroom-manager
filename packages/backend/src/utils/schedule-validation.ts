import { z } from 'zod';

/**
 * Time format regex (HH:MM)
 */
const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Validation schema for creating a time slot.
 */
export const createTimeSlotSchema = z
  .object({
    dayOfWeek: z.coerce
      .number()
      .int()
      .min(0, 'Day of week must be between 0 (Sunday) and 6 (Saturday)')
      .max(6, 'Day of week must be between 0 (Sunday) and 6 (Saturday)'),
    startTime: z
      .string()
      .regex(timeRegex, 'Start time must be in HH:MM format (e.g., 08:00)'),
    endTime: z
      .string()
      .regex(timeRegex, 'End time must be in HH:MM format (e.g., 09:30)'),
    classId: z.string().min(1, 'Class ID is required'),
    subjectId: z.string().min(1, 'Subject ID is required'),
    teacherId: z.string().min(1, 'Teacher ID is required'),
    roomId: z.string().min(1, 'Room ID is required'),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: 'End time must be after start time',
    path: ['endTime'],
  });

/**
 * Validation schema for updating a time slot.
 */
export const updateTimeSlotSchema = z
  .object({
    dayOfWeek: z.coerce
      .number()
      .int()
      .min(0, 'Day of week must be between 0 (Sunday) and 6 (Saturday)')
      .max(6, 'Day of week must be between 0 (Sunday) and 6 (Saturday)')
      .optional(),
    startTime: z
      .string()
      .regex(timeRegex, 'Start time must be in HH:MM format (e.g., 08:00)')
      .optional(),
    endTime: z
      .string()
      .regex(timeRegex, 'End time must be in HH:MM format (e.g., 09:30)')
      .optional(),
    classId: z.string().min(1, 'Class ID is required').optional(),
    subjectId: z.string().min(1, 'Subject ID is required').optional(),
    teacherId: z.string().min(1, 'Teacher ID is required').optional(),
    roomId: z.string().min(1, 'Room ID is required').optional(),
    status: z.enum(['SCHEDULED', 'CANCELLED']).optional(),
  })
  .refine(
    (data) => {
      // If both times are provided, validate that end > start
      if (data.startTime && data.endTime) {
        return data.endTime > data.startTime;
      }
      return true;
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    },
  );

/**
 * Validation schema for schedule list query parameters.
 */
export const scheduleListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(1000).optional().default(100),
  classId: z.string().optional(),
  teacherId: z.string().optional(),
  roomId: z.string().optional(),
  dayOfWeek: z.coerce.number().int().min(0).max(6).optional(),
  status: z.enum(['SCHEDULED', 'CANCELLED']).optional(),
});

/**
 * Validation schema for time slot ID parameter.
 */
export const timeSlotIdSchema = z.object({
  id: z.string().min(1, 'Time slot ID is required'),
});

/**
 * Validation schema for validating constraints without saving.
 */
export const validateConstraintsSchema = createTimeSlotSchema;

/**
 * Validation schema for getting available teachers.
 */
export const getAvailableTeachersSchema = z.object({
  dayOfWeek: z.coerce
    .number()
    .int()
    .min(0, 'Day of week must be between 0 (Sunday) and 6 (Saturday)')
    .max(6, 'Day of week must be between 0 (Sunday) and 6 (Saturday)'),
  startTime: z
    .string()
    .regex(timeRegex, 'Start time must be in HH:MM format (e.g., 08:00)'),
  endTime: z
    .string()
    .regex(timeRegex, 'End time must be in HH:MM format (e.g., 09:30)'),
  subjectId: z.string().min(1, 'Subject ID is required'),
});

/**
 * Validation schema for getting available rooms.
 */
export const getAvailableRoomsSchema = z.object({
  dayOfWeek: z.coerce
    .number()
    .int()
    .min(0, 'Day of week must be between 0 (Sunday) and 6 (Saturday)')
    .max(6, 'Day of week must be between 0 (Sunday) and 6 (Saturday)'),
  startTime: z
    .string()
    .regex(timeRegex, 'Start time must be in HH:MM format (e.g., 08:00)'),
  endTime: z
    .string()
    .regex(timeRegex, 'End time must be in HH:MM format (e.g., 09:30)'),
  classId: z.string().optional(),
});

/**
 * TypeScript types inferred from Zod schemas.
 */
export type CreateTimeSlotInput = z.infer<typeof createTimeSlotSchema>;
export type UpdateTimeSlotInput = z.infer<typeof updateTimeSlotSchema>;
export type ScheduleListQuery = z.infer<typeof scheduleListQuerySchema>;
export type GetAvailableTeachersQuery = z.infer<typeof getAvailableTeachersSchema>;
export type GetAvailableRoomsQuery = z.infer<typeof getAvailableRoomsSchema>;
