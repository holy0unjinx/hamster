import { NextFunction, Request, Response } from 'express';
import express from 'express';
import { AuthService } from './service/auth.service';
import { StudentAuthController } from './controller/student.auth.controller';
import { TeacherAuthController } from './controller/teacher.auth.controller';
import { AuthController } from './controller/auth.controller';

const router = express.Router();
const authService = new AuthService();
const studentAuthController = new StudentAuthController(authService);
const teacherAuthController = new TeacherAuthController(authService);
const authController = new AuthController();

router.post(
  '/student/login',
  studentAuthController.login.bind(studentAuthController),
);
router.post(
  '/student/register',
  studentAuthController.register.bind(studentAuthController),
);
router.post(
  '/student/activate',
  studentAuthController.activate.bind(studentAuthController),
);

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
