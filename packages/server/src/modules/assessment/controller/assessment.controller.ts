import prisma from '@/shared/config/database';
import { handleError } from '@/shared/utils/handle.utils';
import { Request, Response } from 'express';

export class AssessmentController {
  constructor() {}
  async checkAssessments(req: Request, res: Response) {
    try {
      if (!req.query.subjectId)
        throw new Error('subjectId 필드가 작성되지 않았습니다.');
      const assessments = await prisma.assessment.findMany({
        where: { subjectId: parseInt(req.query.subjectId as string) },
      });
      res.status(201).json({ success: true, assessments });
    } catch (error) {
      handleError(error, res);
    }
  }

  async addAssessment(req: Request, res: Response) {
    try {
      const { subjectId, title, description, maxScore } = req.body;
      if (!subjectId || !title || !maxScore)
        throw new Error('필드 작성 안하셨어요^^');
      const subjectId_ = parseInt(subjectId as string);
      const maxScore_ = parseFloat(maxScore as string);
      const assessment = await prisma.assessment.create({
        data: {
          subjectId: subjectId_,
          title,
          maxScore: maxScore_,
          description,
        },
      });
      res.status(201).json({ success: true, assessment });
    } catch (error) {
      handleError(error, res);
    }
  }
}
