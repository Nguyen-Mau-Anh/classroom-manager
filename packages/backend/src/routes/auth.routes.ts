import { Router, IRouter } from 'express';

import { authController } from '../controllers/auth.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error-handler.middleware';
import { success } from '../utils/api-response';

const router: IRouter = Router();

// Public routes
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    await authController.login(req, res);
  })
);
router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    await authController.refresh(req, res);
  })
);

// Protected routes
router.post(
  '/logout',
  authenticate,
  asyncHandler(async (req, res) => {
    await authController.logout(req, res);
  })
);
router.get('/me', authenticate, (req, res) => {
  authController.me(req, res);
});

// Admin-only test endpoint
router.get('/admin-only', authenticate, authorize('ADMIN'), (req, res) => {
  success(res, {
    message: 'Welcome, admin!',
    user: req.user,
  });
});

export default router;
