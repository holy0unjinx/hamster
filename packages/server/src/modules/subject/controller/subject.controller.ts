import prisma from '@/shared/config/database';
import { handleError } from '@/shared/utils/handle.utils';
import { Request, Response } from 'express';

export class SubjectController {
  constructor() {}
  async checkSubjects(req: Request, res: Response) {
    try {
      if (!req.query.grade)
        throw new Error('grade 필드가 작성되지 않았습니다.');
      const subjects = await prisma.subject.findMany({
        where: { grade: parseInt(req.query.grade as string) },
      });
      res.status(201).json({ success: true, subjects });
    } catch (error) {
      handleError(error, res);
    }
  }

  async addSubject(req: Request, res: Response) {
    try {
      const { subjectName, grade } = req.body;
      if (!subjectName || !grade) throw new Error('필드 작성 안하셨어요^^');
      const grade_ = parseInt(grade as string);
      const subject = await prisma.subject.create({
        data: { subjectName, grade: grade_ },
      });
      res.status(201).json({ success: true, subject });
    } catch (error) {
      handleError(error, res);
    }
  }
}
