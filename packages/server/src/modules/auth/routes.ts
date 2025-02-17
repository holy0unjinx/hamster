import { NextFunction, Request, Response } from 'express';
import express from 'express';
import { AuthService } from './service/auth.service';
import { AuthController } from './controller/auth.controller';

const router = express.Router();
const authService = new AuthService();
const authController = new AuthController(authService);

router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));

export default router;
