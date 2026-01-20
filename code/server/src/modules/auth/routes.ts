import express from 'express';
import { AuthService } from './service/auth.service';
import { TeacherAuthController } from './controller/teacher.auth.controller';
import { AuthController } from './controller/auth.controller';

const router = express.Router();
const authService = new AuthService();
const teacherAuthController = new TeacherAuthController(authService);
const authController = new AuthController();

router.post(
  '/teacher/login',
  teacherAuthController.login.bind(teacherAuthController),
);
router.post(
  '/teacher/register',
  teacherAuthController.register.bind(teacherAuthController),
);

router.post('/logout', authController.logout.bind(authController));
router.post('/refresh', authController.refresh.bind(authController));

export default router;
