import { NextFunction, Request, Response } from 'express';
import express from 'express';
import authRouter from '@modules/auth/routes';
import studentRouter from '@modules/student/routes';
import scheduleRouter from '@modules/schedule/routes';
const router = express.Router();

router.use('/auth', authRouter);
router.use('/students', studentRouter);
router.use('/schedule', scheduleRouter);

export default router;
