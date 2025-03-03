import prisma from '../../../shared/config/database';
import { ROLE } from '../../../shared/types/auth.dto';
import {
  InsufficientAuthorityError,
  InvalidQueryError,
  UserNotFoundError,
} from '../../../shared/types/error.type';
import { handleError } from '../../../shared/utils/handle.utils';
import { validateRole } from '../../../shared/utils/role.utils';
import { Request, Response } from 'express';

export class StudentController {
  async checkOneself(req: Request, res: Response) {
    try {
      // 타입 가드를 통한 사용자 검증
      const user = req.user;
      validateRole(user, [ROLE.STUDENT]);

      const userId = Number(user!.id);
      if (isNaN(userId)) {
        throw new UserNotFoundError();
      }

      const student = await prisma.student.findUnique({
        where: { id: userId },
        select: {
          // 필요한 필드만 선택적으로 조회
          id: true,
          studentNumber: true,
          name: true,
          grade: true,
          class: true,
          number: true,
          // 민감한 정보는 제외
        },
      });

      if (!student) {
        throw new UserNotFoundError();
      }

      res.status(200).json({
        success: true,
        data: student,
      });
    } catch (error) {
      handleError(error, res);
    }
  }

  async checkStudents(req: Request, res: Response) {
    try {
      // 권한 체크
      validateRole(req.user, [ROLE.TEACHER, ROLE.ADMIN]);

      const studentGrade = req.query.grade
        ? parseInt(req.query.grade as string)
        : undefined;
      const studentClass = req.query.class
        ? parseInt(req.query.class as string)
        : undefined;

      // class가 있는데 grade가 없는 경우 에러 처리
      if (studentClass && !studentGrade) {
        throw new InvalidQueryError('학년 없이 반을 지정할 수 없습니다.');
      }

      // 동적으로 where 조건 구성
      const whereCondition: any = {};
      if (studentGrade) {
        whereCondition.grade = studentGrade;
        if (studentClass) {
          whereCondition.class = studentClass;
        }
      }

      const students = await prisma.student.findMany({
        where: whereCondition,
        select: {
          id: true,
          studentNumber: true,
          name: true,
          grade: true,
          class: true,
          number: true,
        },
      });

      res.status(200).json({
        success: true,
        data: students,
      });
    } catch (error) {
      handleError(error, res);
    }
  }
}
