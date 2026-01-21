import { Router, IRouter } from 'express';

import { teacherController } from '../controllers/teacher.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error-handler.middleware';
import { validate, validateParams } from '../middlewares/validate.middleware';
import {
  createTeacherSchema,
  updateTeacherSchema,
  teacherIdSchema,
  teacherListQuerySchema,
} from '../utils/teacher-validation';

const router: IRouter = Router();

// All teacher routes require authentication and admin role
router.use(authenticate, authorize('ADMIN'));

// POST /api/teachers - Create teacher
router.post(
  '/',
  validate({ body: createTeacherSchema }),
  asyncHandler(async (req, res) => {
    await teacherController.create(req, res);
  }),
);

// GET /api/teachers - List teachers
router.get(
  '/',
  validate({ query: teacherListQuerySchema }),
  asyncHandler(async (req, res) => {
    await teacherController.list(req, res);
  }),
);

// GET /api/teachers/:id - Get teacher by ID
router.get(
  '/:id',
  validateParams(teacherIdSchema),
  asyncHandler(async (req, res) => {
    await teacherController.getById(req, res);
  }),
);

// PUT /api/teachers/:id - Update teacher
router.put(
  '/:id',
  validate({ params: teacherIdSchema, body: updateTeacherSchema }),
  asyncHandler(async (req, res) => {
    await teacherController.update(req, res);
  }),
);

// DELETE /api/teachers/:id - Soft delete teacher
router.delete(
  '/:id',
  validateParams(teacherIdSchema),
  asyncHandler(async (req, res) => {
    await teacherController.softDelete(req, res);
  }),
);

// GET /api/teachers/:id/workload - Get teacher workload
router.get(
  '/:id/workload',
  validateParams(teacherIdSchema),
  asyncHandler(async (req, res) => {
    await teacherController.getWorkload(req, res);
  }),
);

export default router;
