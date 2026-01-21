import { Router, IRouter } from 'express';

import { classController } from '../controllers/class.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error-handler.middleware';
import { validate, validateParams } from '../middlewares/validate.middleware';
import {
  createClassSchema,
  updateClassSchema,
  classIdSchema,
  classListQuerySchema,
} from '../utils/class-validation';

const router: IRouter = Router();

// All class routes require authentication and admin role
router.use(authenticate, authorize('ADMIN'));

// POST /api/classes - Create class
router.post(
  '/',
  validate({ body: createClassSchema }),
  asyncHandler(async (req, res) => {
    await classController.create(req, res);
  }),
);

// GET /api/classes - List classes
router.get(
  '/',
  validate({ query: classListQuerySchema }),
  asyncHandler(async (req, res) => {
    await classController.list(req, res);
  }),
);

// GET /api/classes/:id - Get class by ID
router.get(
  '/:id',
  validateParams(classIdSchema),
  asyncHandler(async (req, res) => {
    await classController.getById(req, res);
  }),
);

// GET /api/classes/:id/waitlist - Get class waitlist
router.get(
  '/:id/waitlist',
  validateParams(classIdSchema),
  asyncHandler(async (req, res) => {
    await classController.getWaitlist(req, res);
  }),
);

// PUT /api/classes/:id - Update class
router.put(
  '/:id',
  validate({ params: classIdSchema, body: updateClassSchema }),
  asyncHandler(async (req, res) => {
    await classController.update(req, res);
  }),
);

// DELETE /api/classes/:id - Delete class
router.delete(
  '/:id',
  validateParams(classIdSchema),
  asyncHandler(async (req, res) => {
    await classController.delete(req, res);
  }),
);

export default router;
