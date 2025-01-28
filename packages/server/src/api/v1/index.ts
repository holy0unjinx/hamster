import { NextFunction, Request, Response } from 'express';
import express from 'express';
import authRouter from '@modules/auth/routes';
const router = express.Router();

router.use('/auth', authRouter);

export default router;
