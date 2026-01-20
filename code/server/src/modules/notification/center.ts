import prisma from '../../shared/config/database';
import admin from 'firebase-admin';
import { Request, Response } from 'express';
import { messaging } from 'firebase-admin';
// 또는 타입 직접 임포트
import type { MulticastMessage, BatchResponse } from 'firebase-admin/messaging';

// 타입 정의
interface AssessmentData {
  id: number;
  title: string;
  subject: string;
  dueDate: Date;
  remainingDays: number;
  url: string;
}

interface FirestoreDocument {
  token: string;
  classId: string;
}

const getKSTDate = (date = new Date()): Date => {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const kstOffset = 9 * 60 * 60 * 1000; // UTC+9
  return new Date(utc + kstOffset);
};

const getKSTMidnight = (date: Date): Date => {
  const kstDate = getKSTDate(date);
  kstDate.setHours(0, 0, 0, 0);
  return kstDate;
};

const isAfterNoon = (date: Date): boolean => {
  return getKSTDate(date).getHours() >= 12;
};

const getTargetAssessmentDate = (now: Date, assessmentDate: Date): string => {
  const nowKST = getKSTDate(now);
  const examKST = getKSTDate(assessmentDate);
  const todayMidnight = getKSTMidnight(now);
  const tomorrowMidnight = new Date(todayMidnight.getTime() + 86400000);

  if (isAfterNoon(nowKST)) {
    if (
      examKST >= tomorrowMidnight &&
      examKST < new Date(tomorrowMidnight.getTime() + 86400000)
    ) {
      return '내일';
    }
  } else {
    if (examKST >= todayMidnight && examKST < tomorrowMidnight) {
      return '오늘';
    } else if (
      examKST >= tomorrowMidnight &&
      examKST < new Date(tomorrowMidnight.getTime() + 86400000)
    ) {
      return '내일';
    }
  }

  const diffDays = Math.ceil(
    (examKST.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24),
  );
  return `${diffDays}일 뒤`;
};

// FCM 토큰 배치 처리 함수 (500개 제한 대응)
const sendNotificationInBatches = async (
  tokens: string[],
  message: Omit<MulticastMessage, 'tokens'>,
): Promise<{ successCount: number; failureCount: number }> => {
  const BATCH_SIZE = 500;
  let totalSuccessCount = 0;
  let totalFailureCount = 0;

  for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
    const batchTokens = tokens.slice(i, i + BATCH_SIZE);

    const batchMessage: MulticastMessage = {
      ...message,
      tokens: batchTokens,
    };

    try {
      const response: BatchResponse = await admin
        .messaging()
        .sendEachForMulticast(batchMessage);
      totalSuccessCount += response.successCount;
      totalFailureCount += response.failureCount;

      // 실패한 토큰 로깅
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(batchTokens[idx]);
            console.warn(
              `Failed to send to token: ${batchTokens[idx]}, Error: ${resp.error?.message}`,
            );
          }
        });
      }
    } catch (error) {
      console.error('FCM 배치 전송 중 오류:', error);
      totalFailureCount += batchTokens.length;
    }
  }

  return { successCount: totalSuccessCount, failureCount: totalFailureCount };
};

export const sendAssessmentNotifications = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // 입력 검증
    const daysParam = req.query.days as string;
    if (daysParam && (isNaN(parseInt(daysParam)) || parseInt(daysParam) < 0)) {
      res.status(400).json({
        success: false,
        message: '올바른 일수를 입력해주세요.',
      });
      return;
    }

    const days = parseInt(daysParam) || 3;
    const now = new Date();
    const today = getKSTMidnight(now);
    const targetDate = getKSTMidnight(new Date(now));
    targetDate.setDate(targetDate.getDate() + days);

    // 시간대 변환을 위한 UTC 오프셋 (KST는 UTC+9)
    const kstToUtcOffset = 9 * 60 * 60 * 1000;

    try {
      // Prisma 쿼리 (UTC로 저장된 데이터 기준)
      const upcomingAssessments = await prisma.assessment.findMany({
        where: {
          examDate: {
            gte: new Date(today.getTime() - kstToUtcOffset),
            lte: new Date(targetDate.getTime() - kstToUtcOffset),
          },
        },
        include: {
          teacher: {
            select: {
              subjectName: true,
            },
          },
        },
      });

      if (upcomingAssessments.length === 0) {
        res.status(200).json({
          success: true,
          message: `${days}일 이내 예정된 수행평가가 없습니다.`,
          affectedClasses: [],
        });
        return;
      }

      // 반별로 수행평가 그룹화
      const assessmentsByClass = new Map<string, AssessmentData[]>();

      upcomingAssessments.forEach((assessment) => {
        const classId =
          String(assessment.grade) + String(assessment.class).padStart(2, '0');

        if (!assessmentsByClass.has(classId)) {
          assessmentsByClass.set(classId, []);
        }

        const assessmentData: AssessmentData = {
          id: assessment.id,
          title: assessment.title,
          subject: assessment.teacher?.subjectName || '알 수 없음',
          dueDate: assessment.examDate,
          remainingDays: Math.ceil(
            (assessment.examDate.getTime() - today.getTime()) /
              (1000 * 60 * 60 * 24),
          ),
          url: `/assessment/${assessment.id}`,
        };

        assessmentsByClass.get(classId)?.push(assessmentData);
      });

      const notificationResults: Array<{
        classId: string;
        success: boolean;
        details: any;
      }> = [];

      // Firebase Admin 초기화 확인
      if (!admin.apps.length) {
        throw new Error('Firebase Admin이 초기화되지 않았습니다.');
      }

      const db = admin.firestore();

      // 각 반별로 FCM 토큰 조회 및 알림 발송
      for (const [classId, assessments] of assessmentsByClass.entries()) {
        try {
          // Firestore에서 해당 반의 FCM 토큰 조회
          const tokensSnapshot = await db
            .collection('fcmTokens')
            .where('classId', '==', classId)
            .get();

          if (tokensSnapshot.empty) {
            console.log(`${classId}반에 등록된 토큰이 없습니다.`);
            notificationResults.push({
              classId,
              success: false,
              details: '등록된 토큰이 없음',
            });
            continue;
          }

          const tokens: string[] = [];
          tokensSnapshot.forEach((doc) => {
            const docData = doc.data() as FirestoreDocument;
            if (docData.token && typeof docData.token === 'string') {
              tokens.push(docData.token);
            }
          });

          if (tokens.length === 0) {
            console.log(`${classId}반에 유효한 토큰이 없습니다.`);
            continue;
          }

          // 알림 대상 수행평가 필터링
          const relevantAssessments = assessments.filter((assessment) => {
            const targetDate = getTargetAssessmentDate(now, assessment.dueDate);
            return (
              targetDate === '오늘' ||
              targetDate === '내일' ||
              targetDate.includes('일 뒤')
            );
          });

          if (relevantAssessments.length === 0) {
            continue;
          }

          // 날짜별 그룹화 및 우선순위 결정
          const assessmentsByDate = new Map<string, AssessmentData[]>();
          relevantAssessments.forEach((assessment) => {
            const targetDate = getTargetAssessmentDate(now, assessment.dueDate);
            if (!assessmentsByDate.has(targetDate)) {
              assessmentsByDate.set(targetDate, []);
            }
            assessmentsByDate.get(targetDate)?.push(assessment);
          });

          // 가장 가까운 날짜의 수행평가 선택
          let primaryDate = '';
          let primaryAssessments: AssessmentData[] = [];

          if (assessmentsByDate.has('오늘')) {
            primaryDate = '오늘';
            primaryAssessments = assessmentsByDate.get('오늘')!;
          } else if (assessmentsByDate.has('내일')) {
            primaryDate = '내일';
            primaryAssessments = assessmentsByDate.get('내일')!;
          } else {
            const futureDates = Array.from(assessmentsByDate.keys())
              .filter((date) => date.includes('일 뒤'))
              .sort((a, b) => {
                const daysA = parseInt(a.replace('일 뒤', ''));
                const daysB = parseInt(b.replace('일 뒤', ''));
                return daysA - daysB;
              });

            if (futureDates.length > 0) {
              primaryDate = futureDates[0];
              primaryAssessments = assessmentsByDate.get(primaryDate)!;
            }
          }

          // 알림 메시지 구성
          const notificationTitle = `${primaryDate}에 예정된 수행평가 알림`;
          let notificationBody = '';

          if (primaryAssessments.length === 1) {
            notificationBody = `${primaryAssessments[0].subject} 수행평가가 ${primaryDate}에 예정되어있습니다.`;
          } else if (primaryAssessments.length === 2) {
            notificationBody = `${primaryAssessments[0].subject}, ${primaryAssessments[1].subject} 수행평가가 ${primaryDate}에 예정되어있습니다.`;
          } else if (primaryAssessments.length >= 3) {
            notificationBody = `${primaryAssessments.length}개의 수행평가가 ${primaryDate}에 예정되어있습니다.`;
          }

          // FCM 메시지 구성 (MulticastMessage 타입 사용)
          const messagePayload = {
            notification: {
              title: notificationTitle,
              body: notificationBody,
            },
            data: {
              type: 'assessment_reminder',
              assessments: JSON.stringify(assessments),
              url:
                assessments.length > 0
                  ? `/assessment/${assessments[0].id}`
                  : '/',
              classId: classId,
            },
            android: {
              priority: 'high' as const,
            },
            apns: {
              payload: {
                aps: {
                  contentAvailable: true,
                },
              },
            },
          };

          // 배치 처리로 FCM 전송
          const response = await sendNotificationInBatches(
            tokens,
            messagePayload,
          );

          console.log(
            `${classId}반에 알림 발송 완료: 성공 ${response.successCount}건, 실패 ${response.failureCount}건`,
          );

          notificationResults.push({
            classId,
            success: response.successCount > 0,
            details: {
              successCount: response.successCount,
              failureCount: response.failureCount,
              totalTokens: tokens.length,
            },
          });
        } catch (classError) {
          console.error(`${classId}반 알림 발송 중 오류:`, classError);
          notificationResults.push({
            classId,
            success: false,
            details:
              classError instanceof Error
                ? classError.message
                : '알 수 없는 오류',
          });
        }
      }

      res.status(200).json({
        success: true,
        message: `${days}일 이내 예정된 수행평가 알림 발송 완료`,
        affectedClasses: Array.from(assessmentsByClass.keys()),
        results: notificationResults,
      });
    } catch (dbError) {
      console.error('데이터베이스 쿼리 중 오류:', dbError);
      res.status(500).json({
        success: false,
        message: '데이터베이스 조회 중 오류가 발생했습니다.',
        error: dbError instanceof Error ? dbError.message : '데이터베이스 오류',
      });
    }
  } catch (error) {
    console.error('알림 발송 중 오류 발생:', error);
    res.status(500).json({
      success: false,
      message: '알림 발송 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    });
  }
};
