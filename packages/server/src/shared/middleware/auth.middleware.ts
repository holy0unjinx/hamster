import { NextFunction, Request, Response } from 'express';
import {
  AuthenticationError,
  InvalidTokenError,
  TokenExpiredError,
} from '../types/error.type';
import { TokenBlacklist } from '@/modules/auth/model/tokenBlacklist.model';
import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/jwt.config';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const accessToken = req.headers.authorization?.split(' ')[1];

  try {
    if (!accessToken)
      throw new AuthenticationError('인증 토큰이 존재하지 않습니다.');

    const isBlacklisted = await TokenBlacklist.isTokenBlacklisted(accessToken);
    if (isBlacklisted) throw new InvalidTokenError();

    const decoded = jwt.verify(accessToken, JWT_CONFIG.ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new TokenExpiredError());
    }
    next(error);
  }
};
