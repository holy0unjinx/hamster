import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { NextFunction, Request, Response } from 'express';
import express from 'express';
import { SubjectController } from './controller/subject.controller';

const router = express.Router();

const controller = new SubjectController();

router.use(authMiddleware);

router.get('/', controller.checkSubjects);
router.post('/', controller.addSubject);

export default router;
