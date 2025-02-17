import { Request, Response } from 'express';
import { AuthService } from '../service/auth.service';
import { AuthError } from '@/shared/types/error.type';
import { JWT_CONFIG } from '@/shared/config/jwt.config';

export class AuthController {
  constructor(private authService: AuthService) {}

  async register(req: Request, res: Response) {
    try {
      const tokens = await this.authService.registerUser(req.body);
      res.status(201).json({ success: true, data: tokens });
    } catch (error) {
      this.handleAuthError(error, res);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { identifier, password } = req.body;
      const tokens = await this.authService.loginUser(identifier, password);

      res.setHeader('Authorization', `Bearer ${tokens.accessToken}`);
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.json({ success: true, data: tokens });
    } catch (error) {
      this.handleAuthError(error, res);
    }
  }

  private handleAuthError(error: unknown, res: Response) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류';
    const statusCode = error instanceof AuthError ? error.statusCode : 500;
    res.status(statusCode).json({ success: false, error: message });
  }
}
