import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { NextFunction, Request, Response } from 'express';
import express from 'express';
import { AssessmentController } from './controller/assessment.controller';

const router = express.Router();

const controller = new AssessmentController();

router.use(authMiddleware);

router.get('/', controller.checkAssessments);
router.post('/', controller.addAssessment);

export default router;
