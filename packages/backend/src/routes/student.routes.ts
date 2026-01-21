import { Router, IRouter } from 'express';
import multer from 'multer';

import { studentController } from '../controllers/student.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error-handler.middleware';
import { validate, validateParams } from '../middlewares/validate.middleware';
import {
  createStudentSchema,
  updateStudentSchema,
  studentIdSchema,
  studentListQuerySchema,
  importConfirmSchema,
} from '../utils/student-validation';

const router: IRouter = Router();

// Configure multer for CSV file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

// All student routes require authentication and admin or teacher role
router.use(authenticate, authorize('ADMIN', 'TEACHER'));

// POST /api/students/import - Upload CSV for preview
router.post(
  '/import',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    await studentController.importPreview(req, res);
  })
);

// POST /api/students/import/confirm - Confirm bulk import
router.post(
  '/import/confirm',
  validate({ body: importConfirmSchema }),
  asyncHandler(async (req, res) => {
    await studentController.importConfirm(req, res);
  })
);

// POST /api/students - Create student
router.post(
  '/',
  validate({ body: createStudentSchema }),
  asyncHandler(async (req, res) => {
    await studentController.create(req, res);
  })
);

// GET /api/students - List students
router.get(
  '/',
  validate({ query: studentListQuerySchema }),
  asyncHandler(async (req, res) => {
    await studentController.list(req, res);
  })
);

// GET /api/students/:id - Get student by ID
router.get(
  '/:id',
  validateParams(studentIdSchema),
  asyncHandler(async (req, res) => {
    await studentController.getById(req, res);
  })
);

// PUT /api/students/:id - Update student
router.put(
  '/:id',
  validate({ params: studentIdSchema, body: updateStudentSchema }),
  asyncHandler(async (req, res) => {
    await studentController.update(req, res);
  })
);

// DELETE /api/students/:id - Soft delete student
router.delete(
  '/:id',
  validateParams(studentIdSchema),
  asyncHandler(async (req, res) => {
    await studentController.softDelete(req, res);
  })
);

export default router;
