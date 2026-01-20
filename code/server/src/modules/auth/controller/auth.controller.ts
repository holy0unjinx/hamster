import { InvalidTokenError } from '../../../shared/types/error.type';
import { Token } from '../../../shared/types/jwt.type';
import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { TokenBlacklist } from '../model/tokenBlacklist.model';
import { refreshToken } from '../service/auth.service';

const commonCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'none' as const,
  partitioned: true,
};

export async function addToken(res: Response, tokens: Token) {
  const setJwtCookie = (name: string, token: string) => {
    const decoded = jwt.decode(token) as JwtPayload;
    if (!decoded || !decoded.exp) throw new InvalidTokenError();
    res.cookie(name, token, {
      ...commonCookieOptions,
      expires: new Date(decoded.exp * 1000),
    });
  };

  setJwtCookie('access-token', tokens.accessToken);
  setJwtCookie('refresh-token', tokens.refreshToken);

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
      sameSite: 'none',
      partitioned: true,
    });
    res.clearCookie('refresh-token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      partitioned: true,
    });

    res.status(201).json({ success: true });
  }

  async refresh(req: Request, res: Response) {
    const tokens = await refreshToken(req, res);
    res.status(201).json({ success: true, data: tokens });
  }
}
