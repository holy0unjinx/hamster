import express from 'express';
import { AssessmentController } from './controller/assessment.controller';

const router = express.Router();

const controller = new AssessmentController();

router.get('/', controller.checkAssessments);
router.post('/', controller.addAssessment);
router.delete('/', controller.removeAssessment);

export default router;
