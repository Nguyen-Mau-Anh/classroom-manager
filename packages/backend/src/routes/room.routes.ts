import { Router, IRouter } from 'express';

import { roomController } from '../controllers/room.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error-handler.middleware';
import { validate, validateParams } from '../middlewares/validate.middleware';
import {
  createRoomSchema,
  updateRoomSchema,
  roomIdSchema,
  roomListQuerySchema,
  roomScheduleQuerySchema,
} from '../utils/room-validation';

const router: IRouter = Router();

// All room routes require authentication and admin role
router.use(authenticate, authorize('ADMIN'));

// POST /api/rooms - Create room
router.post(
  '/',
  validate({ body: createRoomSchema }),
  asyncHandler(async (req, res) => {
    await roomController.create(req, res);
  }),
);

// GET /api/rooms - List rooms
router.get(
  '/',
  validate({ query: roomListQuerySchema }),
  asyncHandler(async (req, res) => {
    await roomController.list(req, res);
  }),
);

// GET /api/rooms/:id - Get room by ID
router.get(
  '/:id',
  validateParams(roomIdSchema),
  asyncHandler(async (req, res) => {
    await roomController.getById(req, res);
  }),
);

// GET /api/rooms/:id/schedule - Get room schedule
router.get(
  '/:id/schedule',
  validate({ params: roomIdSchema, query: roomScheduleQuerySchema }),
  asyncHandler(async (req, res) => {
    await roomController.getSchedule(req, res);
  }),
);

// PUT /api/rooms/:id - Update room
router.put(
  '/:id',
  validate({ params: roomIdSchema, body: updateRoomSchema }),
  asyncHandler(async (req, res) => {
    await roomController.update(req, res);
  }),
);

// DELETE /api/rooms/:id - Delete room
router.delete(
  '/:id',
  validateParams(roomIdSchema),
  asyncHandler(async (req, res) => {
    await roomController.delete(req, res);
  }),
);

export default router;
