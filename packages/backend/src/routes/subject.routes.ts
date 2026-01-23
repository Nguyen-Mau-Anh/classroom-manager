import { Router, IRouter } from 'express';

import { subjectController } from '../controllers/subject.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error-handler.middleware';
import { validate, validateParams } from '../middlewares/validate.middleware';
import {
  createSubjectSchema,
  updateSubjectSchema,
  subjectIdSchema,
  subjectListQuerySchema,
  assignTeachersSchema,
} from '../utils/subject-validation';

const router: IRouter = Router();

// All subject routes require authentication
router.use(authenticate);

// POST /api/subjects - Create subject (Admin only)
router.post(
  '/',
  authorize('ADMIN'),
  validate({ body: createSubjectSchema }),
  asyncHandler(async (req, res) => {
    await subjectController.create(req, res);
  }),
);

// GET /api/subjects - List subjects (All authenticated users)
router.get(
  '/',
  validate({ query: subjectListQuerySchema }),
  asyncHandler(async (req, res) => {
    await subjectController.list(req, res);
  }),
);

// GET /api/subjects/:id - Get subject by ID (All authenticated users)
router.get(
  '/:id',
  validateParams(subjectIdSchema),
  asyncHandler(async (req, res) => {
    await subjectController.getById(req, res);
  }),
);

// GET /api/subjects/:id/teachers - Get qualified teachers (All authenticated users)
router.get(
  '/:id/teachers',
  validateParams(subjectIdSchema),
  asyncHandler(async (req, res) => {
    await subjectController.getQualifiedTeachers(req, res);
  }),
);

// PUT /api/subjects/:id - Update subject (Admin only)
router.put(
  '/:id',
  authorize('ADMIN'),
  validate({ params: subjectIdSchema, body: updateSubjectSchema }),
  asyncHandler(async (req, res) => {
    await subjectController.update(req, res);
  }),
);

// PUT /api/subjects/:id/teachers - Update qualified teachers (Admin only)
router.put(
  '/:id/teachers',
  authorize('ADMIN'),
  validate({ params: subjectIdSchema, body: assignTeachersSchema }),
  asyncHandler(async (req, res) => {
    await subjectController.updateQualifiedTeachers(req, res);
  }),
);

// DELETE /api/subjects/:id - Delete subject (Admin only)
router.delete(
  '/:id',
  authorize('ADMIN'),
  validateParams(subjectIdSchema),
  asyncHandler(async (req, res) => {
    await subjectController.delete(req, res);
  }),
);

export default router;
