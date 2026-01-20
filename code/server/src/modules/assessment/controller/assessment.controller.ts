import { parseDateString } from '../../../shared/utils/date.utils';
import prisma from '../../../shared/config/database';
import { handleError } from '../../../shared/utils/handle.utils';
import { validateField } from '../../../shared/utils/validation.utils';
import { Request, Response } from 'express';
import { deleteOldAssessments } from '../../../shared/utils/assessment.utils';

export class AssessmentController {
  constructor() {}
  async checkAssessments(req: Request, res: Response) {
    try {
      await deleteOldAssessments(prisma);

      let assessments;
      if (!req.query.grade && !req.query.class && !req.query.id) {
        assessments = await prisma.assessment.findMany({
          include: {
            teacher: {
              select: {
                name: true,
                subjectName: true,
              },
            },
          },
        });
      } else if (req.query.id) {
        assessments = await prisma.assessment.findUnique({
          where: {
            id: Number(req.query.id),
          },
          include: {
            teacher: {
              select: {
                name: true,
                subjectName: true,
              },
            },
          },
        });
      } else {
        assessments = await prisma.assessment.findMany({
          where: {
            grade: parseInt(req.query.grade as string),
            class: parseInt(req.query.class as string),
          },
          include: {
            teacher: {
              select: {
                name: true,
                subjectName: true,
              },
            },
          },
        });
      }
      res.status(200).json({ success: true, assessments });
    } catch (error) {
      handleError(error, res);
    }
  }

  async removeAssessment(req: Request, res: Response) {
    try {
      const id = validateField({
        name: 'id',
        type: Number,
        raw: req.body.id,
      });
      const assessment = await prisma.assessment.delete({
        where: {
          id,
        },
      });
      res.status(201).json({ success: true, assessment });
    } catch (error) {
      handleError(error, res);
    }
  }

  async addAssessment(req: Request, res: Response) {
    try {
      const teacherId = validateField({
        name: 'teacherId',
        type: Number,
        raw: req.body.teacherId,
      });
      const title = validateField({
        name: 'title',
        type: String,
        raw: req.body.title,
      });
      const description = validateField({
        name: 'description',
        type: String,
        raw: req.body.description,
      });
      let maxScore = validateField({
        name: 'maxScore',
        type: String,
        raw: req.body.maxScore,
      });
      let grade = validateField({
        name: 'grade',
        type: Number,
        raw: req.body.grade,
      });
      let _class = validateField({
        name: 'class',
        type: Number,
        raw: req.body.class,
      });
      let period = validateField({
        name: 'period',
        type: Number,
        raw: req.body.period,
      });
      let examDate = validateField({
        name: 'examDate',
        type: String,
        raw: req.body.examDate,
      });
      maxScore = parseFloat(maxScore as string);
      const assessment = await prisma.assessment.create({
        data: {
          teacherId,
          title,
          maxScore,
          description,
          grade,
          class: _class,
          period: req.body.period,
          examDate: parseDateString(examDate),
        },
      });
      res.status(201).json({ success: true, assessment });
    } catch (error) {
      handleError(error, res);
    }
  }
}
