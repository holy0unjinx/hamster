import { NextFunction, Request, Response } from 'express';
import express from 'express';
import authRouter from '@modules/auth/routes';
import studentRouter from '@modules/student/routes';
import scheduleRouter from '@modules/schedule/routes';
import assessmentRouter from '@modules/assessment/routes';
import subjectRouter from '@modules/subject/routes';
const router = express.Router();

router.use('/auth', authRouter);
router.use('/students', studentRouter);
router.use('/schedule', scheduleRouter);
router.use('/assessment', assessmentRouter);
router.use('/subject', subjectRouter);

export default router;
