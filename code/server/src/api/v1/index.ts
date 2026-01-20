import express from 'express';
import authRouter from '../../modules/auth/routes';
import teacherRouter from '../../modules/teacher/routes';
import scheduleRouter from '../../modules/schedule/routes';
import assessmentRouter from '../../modules/assessment/routes';
import timetableRouter from '../../modules/timetable/routes';
import { sendAssessmentNotifications } from '../../modules/notification/center';
import { sendSchoolUniformDayNotification } from '../../modules/notification/sabok';
const router = express.Router();

router.use('/auth', authRouter);
router.use('/schedule', scheduleRouter);
router.use('/assessment', assessmentRouter);
router.use('/timetable', timetableRouter);
router.use('/teacher', teacherRouter);
router.get('/notifications/assessment', sendAssessmentNotifications);
router.get('/notifications/sabok', sendSchoolUniformDayNotification); // 이 부분 추가
export default router;
