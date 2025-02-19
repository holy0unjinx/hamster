import prisma from '@/shared/config/database';
import {
  InsufficientAuthorityError,
  InvalidInformationError,
} from '@/shared/types/error.type';
import { handleError } from '@/shared/utils/handle.utils';
import { Request, Response } from 'express';

export class StudentController {
  async checkOneself(req: Request, res: Response) {
    try {
      if (req.user!.role !== 'student') throw new InsufficientAuthorityError();
      const student = await prisma.student.findUnique({
        where: { id: parseInt(req.user!.id as string) },
      });
      res.status(201).json({ success: true, data: student });
    } catch (error) {
      handleError(error, res);
    }
  }

  async checkStudents(req: Request, res: Response) {
    try {
      if (req.user!.role === 'student') throw new InsufficientAuthorityError();
      const studentGrade = req.query.grade;
      const studentClass = req.query.class;
      if (!studentGrade || !studentClass) throw new InvalidInformationError();
      const students = await prisma.student.findMany({
        where: {
          grade: parseInt(studentGrade as string),
          class: parseInt(studentClass as string),
        },
      });
      res.status(201).json({ success: true, data: students });
    } catch (error) {
      handleError(error, res);
    }
  }
}
