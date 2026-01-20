import { PrismaClient } from '@prisma/client/extension';
import { handleError } from './handle.utils';

export async function deleteOldAssessments(
  prismaClient: PrismaClient,
  beforeDays: number = 30,
) {
  const beforeDaysAgo = new Date();
  beforeDaysAgo.setDate(beforeDaysAgo.getDate() - beforeDays);

  // 30일 이상 지난 수행평가 삭제
  try {
    await prismaClient.assessment.deleteMany({
      where: {
        examDate: {
          lt: beforeDaysAgo,
        },
      },
    });
  } catch (error) {
    new Error('오래된 수행평가 내용을 지우는 중 오류 발생: ' + error);
  }
}
