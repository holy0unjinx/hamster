import {
  AuthError,
  InvalidTokenError,
  TokenExpiredError,
} from '@type/error.type';
import { Token } from '@type/jwt.type';
import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { TokenBlacklist } from '../model/tokenBlacklist.model';
import { authUtils } from '@/shared/utils/auth.utils';
import { logger } from '@/shared/utils/logger';
import { JWT_CONFIG } from '@/shared/config/jwt.config';

export async function addToken(res: Response, tokens: Token) {
  const accessTokenDecode = jwt.decode(tokens.accessToken) as JwtPayload;
  if (!accessTokenDecode || !accessTokenDecode.exp)
    throw new InvalidTokenError();
  res.cookie('access-token', tokens.accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    expires: new Date(accessTokenDecode.exp * 1000),
  });

  const refreshTokenDecode = jwt.decode(tokens.refreshToken) as JwtPayload;
  if (!refreshTokenDecode || !refreshTokenDecode.exp)
    throw new InvalidTokenError();
  res.cookie('refresh-token', tokens.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    expires: new Date(refreshTokenDecode.exp * 1000),
  });

  res.setHeader('Authorization', `Bearer ${tokens.accessToken}`);
}

export function handleAuthError(error: unknown, res: Response) {
  const message = error instanceof Error ? error.message : '알 수 없는 오류';
  const statusCode = error instanceof AuthError ? error.statusCode : 500;
  const errorCode =
    error instanceof AuthError ? error.code : 'UNEXPECTED_ERROR';
  res
    .status(statusCode)
    .json({ success: false, error: errorCode, message: message });
}

export class AuthController {
  async logout(req: Request, res: Response) {
    // 사용자 쿠키에서 토큰 추출
    const accessToken = req.cookies['access-token'];
    const refreshToken = req.cookies['refresh-token'];

    // 무효화
    await TokenBlacklist.addToBlacklist(refreshToken);
    await TokenBlacklist.addToBlacklist(accessToken);

    // 사용자 쿠키 제거
    res.removeHeader('Authorization');
    res.clearCookie('access-token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
    res.clearCookie('refresh-token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    res.status(201).json({ success: true });
  }

  async refresh(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies['refresh-token'];
      // 뭐 각종 오류 처리
      if (!refreshToken) throw new InvalidTokenError();
      if (await TokenBlacklist.isTokenBlacklisted(refreshToken))
        throw new TokenExpiredError();

      // refresh token 시간 별로 없으면 refresh 토큰 같이 해줌
      const refreshTokenDecode = jwt.decode(refreshToken) as JwtPayload;
      if (!refreshTokenDecode || !refreshTokenDecode.exp)
        throw new InvalidTokenError();
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const threeDaysInSeconds = 3 * 24 * 60 * 60; // 3일을 초 단위로 변환

      if (refreshTokenDecode.exp - currentTimestamp <= threeDaysInSeconds) {
        const tokens = await authUtils.rotateRefreshToken(refreshToken);
        await addToken(res, tokens);
        await TokenBlacklist.addToBlacklist(refreshToken);
        res.status(201).json({ success: true, data: tokens });
      }

      // 아니면 뭐 걍 지혼자 하라해
      const refreshTokenPayload = jwt.verify(
        refreshToken,
        JWT_CONFIG.REFRESH_SECRET,
      ) as JwtPayload;
      const oldId = refreshTokenPayload.id;
      const oldRole = refreshTokenPayload.role;
      const tokens = authUtils.generateTokens({ id: oldId, role: oldRole });
      await TokenBlacklist.addToBlacklist(refreshToken);
      await addToken(res, tokens);
      res.status(201).json({ success: true, data: tokens });
    } catch (error) {
      handleAuthError(error, res);
    }
  }
}
