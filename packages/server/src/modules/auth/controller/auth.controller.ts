import { InvalidTokenError } from '../../../shared/types/error.type';
import { Token } from '../../../shared/types/jwt.type';
import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { TokenBlacklist } from '../model/tokenBlacklist.model';
import { refreshToken } from '../service/auth.service';

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
    const tokens = await refreshToken(req, res);
    res.status(201).json({ success: true, data: tokens });
  }
}
