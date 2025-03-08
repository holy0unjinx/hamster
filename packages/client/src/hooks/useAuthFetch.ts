import { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie'; // 또는 사용 중인 쿠키 라이브러리

interface Student {
  success: boolean;
  data: {
    id: number;
    studentNumber: number;
    name: string;
    grade: number;
    class: number;
    number: number;
  };
}

const test: Student = {
  success: false,
  data: {
    id: 0,
    studentNumber: 0,
    name: '',
    grade: 0,
    class: 0,
    number: 0,
  },
};

/**
 * 토큰 리프레시를 지원하는 데이터 페칭 훅
 * @param {string} url - 요청할 API 엔드포인트
 * @param {Object} options - fetch 옵션
 * @returns {Object} 데이터, 로딩 상태, 오류 정보를 포함한 객체
 */
export const useAuthFetch = (url: string, options = {}) => {
  const [data, setData] = useState(test);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cookies, setCookie] = useCookies(['access-token', 'refresh-token']);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      try {
        setLoading(true);

        // 첫 번째 요청 시도
        const response = await fetch(url, {
          ...options,
          credentials: 'include',
          signal,
        });

        // 응답이 JSON인지 확인
        const contentType = response.headers.get('content-type');
        let responseData;

        if (contentType?.includes('application/json')) {
          responseData = await response.json();
        } else {
          responseData = await response.text();
        }

        // 토큰 만료 확인
        if (!response.ok && responseData?.error === 'TOKEN_EXPIRED') {
          // 리프레시 토큰으로 새 토큰 요청
          const refreshResponse = await fetch(
            'https://hamster-server.vercel.app/api/v1/auth/refresh',
            {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
              signal,
            },
          );

          if (!refreshResponse.ok) {
            throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
          }

          // 리프레시 응답 처리 및 쿠키 설정
          const result = await refreshResponse.json();
          setCookie('access-token', result.data.accessToken, {
            path: '/',
            secure: true,
            sameSite: 'none',
          });

          setCookie('refresh-token', result.data.refreshToken, {
            path: '/',
            secure: true,
            sameSite: 'none',
          });

          // 새 토큰으로 원래 요청 재시도
          const retryResponse = await fetch(url, {
            ...options,
            credentials: 'include',
            signal,
          });

          if (!retryResponse.ok) {
            throw new Error('서버 응답 오류: ' + retryResponse.status);
          }

          const retryData = await retryResponse.json();
          setData(retryData);
          setLoading(false); // 데이터가 설정된 후에만 로딩 상태 종료
        } else if (!response.ok) {
          // 다른 오류인 경우
          throw new Error(
            typeof responseData === 'string'
              ? responseData
              : responseData?.message || '서버 응답 오류',
          );
        } else {
          // 정상 응답인 경우
          setData(responseData);
          setLoading(false); // 데이터가 설정된 후에만 로딩 상태 종료
        }

        setError(null);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError(err.message);
          setLoading(false); // 오류 발생 시에도 로딩 상태 종료
          console.error('데이터 가져오기 실패:', err);
        }
      }
      // finally 블록 제거
    };

    fetchData();

    // 컴포넌트 언마운트 시 요청 취소
    return () => {
      controller.abort();
    };
  }, [url]);

  return { data, loading, error };
};
