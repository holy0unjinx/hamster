import { authMiddleware } from '../../shared/middleware/auth.middleware';
import express from 'express';
import { ScheduleController } from './controller/schedule.controller';

const router = express.Router();

const scheduleController = new ScheduleController();

router.get('/', scheduleController.checkSchedule);
router.post('/', scheduleController.addSchedule);
router.delete('/', scheduleController.removeSchedule);

export default router;
