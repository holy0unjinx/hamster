import { Request, Response } from 'express';
import { InsufficientAuthorityError } from '@/shared/types/error.type';
import { handleError } from '@/shared/utils/handle.utils';
import prisma from '@/shared/config/database';

export class ScheduleController {
  constructor() {}

  async addSchedule(req: Request, res: Response) {
    try {
      if (req.user?.role !== 'teacher') throw new InsufficientAuthorityError();
      const [startYear, startMonth, startDay] = (req.body.startDate as string)
        .split('-')
        .map(Number);
      const [endYear, endMonth, endDay] = (req.body.endDate as string)
        .split('-')
        .map(Number);
      if (
        isNaN(startYear) ||
        isNaN(startMonth - 1) ||
        isNaN(startDay) ||
        isNaN(endYear) ||
        isNaN(endMonth - 1) ||
        isNaN(endDay)
      )
        throw new Error('날짜 형식이 잘못되었습니다. [YYYY-MM-DD]');
      const schedule = await prisma.schedule.create({
        data: {
          title: req.body.title,
          description: req.body.description || '',
          startDate: new Date(startYear, startMonth - 1, startDay),
          endDate: new Date(endYear, endMonth - 1, endDay),
        },
      });
      res.status(201).json({ success: true, schedule });
    } catch (error) {
      handleError(error, res);
    }
  }

  async checkSchedule(req: Request, res: Response) {
    try {
      const [startYear, startMonth, startDay] = (
        (req.query.startDate as string) || '2025-01-01'
      )
        .split('-')
        .map(Number);
      const [endYear, endMonth, endDay] = (
        (req.query.endDate as string) || '2025-12-31'
      )
        .split('-')
        .map(Number);
      if (
        isNaN(startYear) ||
        isNaN(startMonth - 1) ||
        isNaN(startDay) ||
        isNaN(endYear) ||
        isNaN(endMonth - 1) ||
        isNaN(endDay)
      )
        throw new Error('날짜 형식이 잘못되었습니다. [YYYY-MM-DD]');

      const schedules = await prisma.schedule.findMany({
        where: {
          AND: [
            {
              startDate: { gte: new Date(startYear, startMonth - 1, startDay) },
            },
            { endDate: { lte: new Date(endYear, endMonth - 1, endDay) } },
          ],
        },
      });

      res.status(201).json({ success: true, schedules });
    } catch (error) {
      handleError(error, res);
    }
  }

  async removeSchedule(req: Request, res: Response) {
    try {
      if (req.user?.role !== 'teacher') throw new InsufficientAuthorityError();
      const { id } = req.body;
      await prisma.schedule.delete({ where: { id } });
      res.status(201).json({ success: true });
    } catch (error) {
      handleError(error, res);
    }
  }
}
