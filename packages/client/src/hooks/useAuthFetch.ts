import { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie'; // 또는 사용 중인 쿠키 라이브러리
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      try {
        setLoading(true);
        console.log(cookies);
        console.log(document.cookie);

        // 첫 번째 요청 시도
        const response = await fetch(url, {
          ...options,
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Cookie: 'test=value1; test2=value2',
          },
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
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              signal,
            },
          );

          if (!refreshResponse.ok) {
            // 로그아웃 API 호출
            await fetch(
              'https://hamster-server.vercel.app/api/v1/auth/logout',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                credentials: 'include',
                signal,
              },
            );

            // 쿠키 삭제
            setCookie('access-token', '', {
              path: '/',
              expires: new Date(0),
              secure: true,
              sameSite: 'none',
              maxAge: 15 * 60,
            });

            setCookie('refresh-token', '', {
              path: '/',
              expires: new Date(0),
              secure: true,
              sameSite: 'none',
              maxAge: 7 * 24 * 60 * 60,
            });

            const message: any = '인증이 만료되었습니다. 다시 로그인해주세요.';
            // 오류 설정 및 로딩 상태 종료
            setError(message);
            setLoading(false);

            // 추가 작업이 필요하면 여기에 구현 (예: 로그인 페이지로 리다이렉트)
            navigate('/login');
            return;
          }

          // 리프레시 응답 처리 및 쿠키 설정
          const result = await refreshResponse.json();
          setCookie('access-token', result.data.accessToken, {
            path: '/',
            secure: true,
            sameSite: 'none',
            maxAge: 15 * 60,
          });

          setCookie('refresh-token', result.data.refreshToken, {
            path: '/',
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60,
          });

          // 새 토큰으로 원래 요청 재시도
          const retryResponse = await fetch(url, {
            ...options,
            credentials: 'include',
            signal,
          });

          if (!retryResponse.ok) {
            // 로그아웃 API 호출
            await fetch(
              'https://hamster-server.vercel.app/api/v1/auth/logout',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                credentials: 'include',
                signal,
              },
            );

            // 쿠키 삭제
            setCookie('access-token', '', {
              path: '/',
              expires: new Date(0),
              secure: true,
              sameSite: 'none',
            });

            setCookie('refresh-token', '', {
              path: '/',
              expires: new Date(0),
              secure: true,
              sameSite: 'none',
            });

            const message: any = '인증이 만료되었습니다. 다시 로그인해주세요.';
            // 오류 설정 및 로딩 상태 종료
            setError(message);
            setLoading(false);

            // 추가 작업이 필요하면 여기에 구현 (예: 로그인 페이지로 리다이렉트)
            navigate('/login');
            return;
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
