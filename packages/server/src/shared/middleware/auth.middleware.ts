import { NextFunction, Request, Response } from 'express';
import {
  UnauthorizedError,
  InvalidTokenError,
  TokenExpiredError,
} from '../types/error.type';
import { TokenBlacklist } from '../../modules/auth/model/tokenBlacklist.model';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/jwt.config';
import { refreshToken } from '../../modules/auth/service/auth.service';
import { logger } from '../utils/logger';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let accessToken = req.cookies['access-token'];

  try {
    let refreshToken_ = req.cookies['refresh-token'];
    if (!refreshToken_) throw new UnauthorizedError();
    if (accessToken) {
      const isBlacklisted = await TokenBlacklist.isTokenBlacklisted(
        accessToken,
      );
      if (isBlacklisted) throw new InvalidTokenError();
    }

    const decoded = jwt.verify(
      refreshToken_,
      JWT_CONFIG.REFRESH_SECRET,
    ) as JwtPayload;
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new TokenExpiredError());
    }
    next(error);
  }
};
