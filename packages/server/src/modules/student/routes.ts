import { authMiddleware } from '@/shared/middleware/auth.middleware';
import { NextFunction, Request, Response } from 'express';
import express from 'express';
import { StudentController } from './controller/students.controller';

const router = express.Router();

const studentController = new StudentController();

router.use(authMiddleware);

router.get('/me', studentController.checkOneself);
router.get('/', studentController.checkStudents);

export default router;
