import { NextFunction, Request, Response } from 'express';
import express from 'express';
import v1Router from '@api/v1';

const router = express.Router();

router.use('/v1', v1Router);

export default router;
