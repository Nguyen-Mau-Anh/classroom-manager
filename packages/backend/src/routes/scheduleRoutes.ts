import { Router, IRouter } from 'express';

import { scheduleController } from '../controllers/scheduleController';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error-handler.middleware';
import { validate, validateParams } from '../middlewares/validate.middleware';
import {
  createTimeSlotSchema,
  updateTimeSlotSchema,
  timeSlotIdSchema,
  scheduleListQuerySchema,
  validateConstraintsSchema,
  getAvailableTeachersSchema,
  getAvailableRoomsSchema,
} from '../utils/schedule-validation';

const router: IRouter = Router();

// All schedule routes require authentication
router.use(authenticate);

// POST /api/schedule/validate - Validate constraints without saving (All authenticated users)
router.post(
  '/validate',
  validate({ body: validateConstraintsSchema }),
  asyncHandler(async (req, res) => {
    await scheduleController.validate(req, res);
  }),
);

// GET /api/schedule/available-teachers - Get available teachers (All authenticated users)
router.get(
  '/available-teachers',
  validate({ query: getAvailableTeachersSchema }),
  asyncHandler(async (req, res) => {
    await scheduleController.getAvailableTeachers(req, res);
  }),
);

// GET /api/schedule/available-rooms - Get available rooms (All authenticated users)
router.get(
  '/available-rooms',
  validate({ query: getAvailableRoomsSchema }),
  asyncHandler(async (req, res) => {
    await scheduleController.getAvailableRooms(req, res);
  }),
);

// POST /api/schedule - Create time slot (Admin only)
router.post(
  '/',
  authorize('ADMIN'),
  validate({ body: createTimeSlotSchema }),
  asyncHandler(async (req, res) => {
    await scheduleController.create(req, res);
  }),
);

// GET /api/schedule - List time slots (All authenticated users)
router.get(
  '/',
  validate({ query: scheduleListQuerySchema }),
  asyncHandler(async (req, res) => {
    await scheduleController.list(req, res);
  }),
);

// GET /api/schedule/:id - Get time slot by ID (All authenticated users)
router.get(
  '/:id',
  validateParams(timeSlotIdSchema),
  asyncHandler(async (req, res) => {
    await scheduleController.getById(req, res);
  }),
);

// PUT /api/schedule/:id - Update time slot (Admin only)
router.put(
  '/:id',
  authorize('ADMIN'),
  validate({ params: timeSlotIdSchema, body: updateTimeSlotSchema }),
  asyncHandler(async (req, res) => {
    await scheduleController.update(req, res);
  }),
);

// DELETE /api/schedule/:id - Delete time slot (Admin only)
router.delete(
  '/:id',
  authorize('ADMIN'),
  validateParams(timeSlotIdSchema),
  asyncHandler(async (req, res) => {
    await scheduleController.delete(req, res);
  }),
);

export default router;
