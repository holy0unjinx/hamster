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

      const userId = Number(req.query.id);
      if (isNaN(userId)) {
        throw new UserNotFoundError();
      }

      const student = await prisma.teacher.findUnique({
        where: { id: userId },
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
}
