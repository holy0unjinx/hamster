import bcrypt from 'bcrypt';
import { authUtils } from '../../../shared/utils/auth.utils';
import {
  StudentRegistrationDto,
  TeacherRegistrationDto,
} from '../../../shared/types/auth.dto';
import {
  AccountInactiveError,
  InvalidCredentialsError,
  InvalidTokenError,
  UserAlreadyExistError,
  UserNotFoundError,
} from '../../../shared/types/error.type';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { JWT_CONFIG } from '../../../shared/config/jwt.config';
import prisma from '../../../shared/config/database';
import { Token } from '../../../shared/types/jwt.type';
import { TokenBlacklist } from '../model/tokenBlacklist.model';
import { Request, Response } from 'express';
import { addToken } from '../controller/auth.controller';
import { handleError } from '../../../shared/utils/handle.utils';

export class AuthService {
  async registerTeacher(registrationData: TeacherRegistrationDto) {
    const { email, password, ...profileData } = registrationData;

    // 사용자가 존재하면 (이메일로 탐색) 오류류
    const existingUser = await prisma.teacher.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new UserAlreadyExistError();
    }

    const passwordHash = await bcrypt.hash(password, 10);

    return prisma.$transaction(async (prisma: any) => {
      const user = await prisma.teacher.create({
        data: {
          email,
          passwordHash,
          ...profileData,
        },
      });

      return authUtils.generateTokens({
        id: user.id,
        role: 'teacher',
      });
    });
  }

  async loginTeacher(
    email: string,
    password: string,
  ): Promise<[Token, Number]> {
    // 사용자가 존재하는 확인
    const user = await prisma.teacher.findUnique({ where: { email } });
    if (!user) throw new UserNotFoundError();
    if (!(await bcrypt.compare(password, user.passwordHash)))
      throw new InvalidCredentialsError();

    return [
      authUtils.generateTokens({
        id: user.id,
        role: 'teacher',
      }),
      user.id,
    ];
  }
}

export async function refreshToken(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies['refresh-token'];
    // 뭐 각종 오류 처리
    if (!refreshToken) throw new InvalidTokenError();
    if (await TokenBlacklist.isTokenBlacklisted(refreshToken))
      throw new InvalidTokenError();

    // refresh token 시간 별로 없으면 refresh 토큰 같이 해줌
    const refreshTokenDecode = jwt.decode(refreshToken) as JwtPayload;
    if (!refreshTokenDecode || !refreshTokenDecode.exp)
      throw new InvalidTokenError();
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const threeDaysInSeconds = 7 * 24 * 60 * 60; // 3일을 초 단위로 변환

    if (refreshTokenDecode.exp - currentTimestamp <= threeDaysInSeconds) {
      const tokens = await authUtils.rotateRefreshToken(refreshToken);
      await addToken(res, tokens);
      await TokenBlacklist.addToBlacklist(refreshToken);
      return tokens;
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
    return tokens;
  } catch (error) {
    handleError(error, res);
  }
}
