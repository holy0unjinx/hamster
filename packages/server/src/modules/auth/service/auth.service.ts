import bcrypt from 'bcrypt';
import { authUtils } from '@utils/auth.utils';
import {
  StudentRegistrationDto,
  TeacherRegistrationDto,
} from '@/shared/types/auth.dto';
import {
  AccountInactiveError,
  InvalidCredentialsError,
  InvalidTokenError,
  UserExistError,
  UserNotFoundError,
} from '@/shared/types/error.type';
import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '@config/jwt.config';
import prisma from '@config/database';
import { Token } from '@type/jwt.type';
import { TokenBlacklist } from '../model/tokenBlacklist.model';

export class AuthService {
  async registerStudent(registrationData: StudentRegistrationDto) {
    const { studentNumber, password, ...profileData } = registrationData;

    // 사용자가 존재하면 (학번으로 탐색) 오류류
    const existingUser = await prisma.student.findUnique({
      where: { studentNumber },
    });
    if (existingUser) {
      throw new UserExistError();
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const splitNumber = [
      Math.floor(studentNumber / 10000),
      Math.floor((studentNumber % 10000) / 100),
      studentNumber % 100,
    ];

    return prisma.$transaction(async (prisma: any) => {
      const user = await prisma.student.create({
        data: {
          studentNumber,
          passwordHash,
          ...profileData,
          grade: splitNumber[0],
          class: splitNumber[1],
          number: splitNumber[2],
        },
      });

      return authUtils.generateTokens({
        id: user.id,
        role: 'student',
      });
    });
  }

  async activateStudent(id: number) {
    return prisma.$transaction(async (prisma: any) => {
      await prisma.student.update({
        where: { id },
        data: { activated: true },
      });
    });
  }

  async registerTeacher(registrationData: TeacherRegistrationDto) {
    const { email, password, ...profileData } = registrationData;

    // 사용자가 존재하면 (이메일로 탐색) 오류류
    const existingUser = await prisma.teacher.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new UserExistError();
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

  async loginStudent(studentNumber: number, password: string): Promise<Token> {
    // 사용자가 존재하는 확인
    const user = await prisma.student.findUnique({ where: { studentNumber } });
    if (!user) throw new UserNotFoundError();
    if (!(await bcrypt.compare(password, user.passwordHash)))
      throw new InvalidCredentialsError();
    if (!user.activated) throw new AccountInactiveError();

    return authUtils.generateTokens({
      id: user.id,
      role: 'student',
    });
  }

  async loginTeacher(email: string, password: string): Promise<Token> {
    // 사용자가 존재하는 확인
    const user = await prisma.teacher.findUnique({ where: { email } });
    if (!user) throw new UserNotFoundError();
    if (!(await bcrypt.compare(password, user.passwordHash)))
      throw new InvalidCredentialsError();

    return authUtils.generateTokens({
      id: user.id,
      role: 'teacher',
    });
  }
}
