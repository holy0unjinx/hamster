import prisma from '../../shared/config/database';
import admin from 'firebase-admin';
import { Request, Response } from 'express';
import { messaging } from 'firebase-admin';

// FCM 토큰 배치 처리 함수 (기존 코드 그대로 사용)
const sendNotificationInBatches = async (
  tokens: string[],
  message: Omit<messaging.MulticastMessage, 'tokens'>,
): Promise<{ successCount: number; failureCount: number }> => {
  const BATCH_SIZE = 500;
  let totalSuccessCount = 0;
  let totalFailureCount = 0;

  for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
    const batchTokens = tokens.slice(i, i + BATCH_SIZE);
    const batchMessage: messaging.MulticastMessage = {
      ...message,
      tokens: batchTokens,
    };

    try {
      const response = await admin
        .messaging()
        .sendEachForMulticast(batchMessage);
      totalSuccessCount += response.successCount;
      totalFailureCount += response.failureCount;

      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
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

export const sendSchoolUniformDayNotification = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!admin.apps.length) {
      throw new Error('Firebase Admin이 초기화되지 않았습니다.');
    }

    const db = admin.firestore();

    // Firestore에서 모든 반의 FCM 토큰 조회 (전교생 대상)
    const tokensSnapshot = await db.collection('fcmTokens').get();

    if (tokensSnapshot.empty) {
      res.status(200).json({
        success: true,
        message: '등록된 토큰이 없습니다.',
      });
      return;
    }

    const tokens: string[] = [];
    tokensSnapshot.forEach((doc) => {
      const token = doc.data().token;
      if (token && typeof token === 'string') {
        tokens.push(token);
      }
    });

    if (tokens.length === 0) {
      res.status(200).json({
        success: true,
        message: '유효한 토큰이 없습니다.',
      });
      return;
    }

    // 알림 메시지 구성
    const messagePayload = {
      notification: {
        title: '사복데이',
        body: '오늘은 사복데이입니다! 개성 있는 옷차림은 좋으나, 학생 신분에 맞지 않는 과도한 노출이나 고가의 옷은 자제해 주세요',
      },
      data: {
        type: 'school_uniform_day',
        message:
          '개성 있는 옷차림은 좋으나, 학생 신분에 맞지 않는 과도한 노출이나 고가의 옷은 자제해 주세요',
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
    const response = await sendNotificationInBatches(tokens, messagePayload);

    res.status(200).json({
      success: true,
      message: '전교생에게 사복데이 알림 발송 완료',
      results: {
        successCount: response.successCount,
        failureCount: response.failureCount,
        totalTokens: tokens.length,
      },
    });
  } catch (error) {
    console.error('알림 발송 중 오류 발생:', error);
    res.status(500).json({
      success: false,
      message: '알림 발송 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    });
  }
};
