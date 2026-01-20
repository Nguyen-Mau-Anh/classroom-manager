import { Router, IRouter } from 'express';

import { authController } from '../controllers/auth.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router: IRouter = Router();

// Public routes
router.post('/login', (req, res) => {
  void authController.login(req, res);
});
router.post('/refresh', (req, res) => {
  void authController.refresh(req, res);
});

// Protected routes
router.post('/logout', authenticate, (req, res) => {
  void authController.logout(req, res);
});
router.get('/me', authenticate, (req, res) => {
  authController.me(req, res);
});

// Admin-only test endpoint
router.get('/admin-only', authenticate, authorize('ADMIN'), (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'Welcome, admin!',
      user: req.user,
    },
  });
});

export default router;
