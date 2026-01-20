import React, { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Timetable from './pages/Timetable';
import Calendar from './pages/Calendar';
import Menu from './pages/Menu';
import Login from './pages/auth/Login';
import { useCookies } from 'react-cookie';
import Spinner from './components/Spinner';
import MyPage from './pages/MyPage';
import Policy from './pages/Policy';
import AssessmentDetailPage from './pages/Assessment';
import InstallPrompt from './pages/Install';
import PWAProtectedRoute from './components/PWAProtectedRoute';

// 추가된 컴포넌트
const ErrorMessage = ({ message }: { message: string }) => (
  <div className='error-message'>
    <p>{message}</p>
  </div>
);

function App() {
  const location = useLocation();
  const currentPath = location.pathname.slice(1) || 'home';
  const [cookies] = useCookies(['student-number', 'name']);

  // 로딩 상태 통합 관리
  const [loadingState, setLoadingState] = useState({
    isLoading: true,
    message: '불러오는 중...',
  });
  const [errorState, setErrorState] = useState<string | null>(null);

  // 인증 체크 함수
  const isAuthenticated = !!cookies['student-number'];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchAssessments = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoadingState({ isLoading: true, message: '수행평가 로딩중...' });
      const response = await fetch(
        `https://hamster-server.vercel.app/api/v1/assessment?grade=${localStorage.getItem(
          'grade',
        )}&class=${localStorage.getItem('class')}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        },
      );
      if (!response.ok) {
        throw new Error(
          `수행평가 데이터를 가져오는데 실패했습니다. 상태 코드: ${response.status}`,
        );
      }

      const assessmentData = await response.json();
      const currentDate = new Date();
      const userGrade = localStorage.getItem('grade');
      const userClass = localStorage.getItem('class');

      const filteredAssessments = assessmentData.assessments
        .filter((assessment: any) => {
          const examDate = new Date(assessment.examDate);
          return (
            examDate >= currentDate &&
            assessment.grade.toString() === userGrade &&
            assessment.class.toString() === userClass
          );
        })
        .map((assessment: any) => ({
          id: assessment.id,
          title: assessment.title,
          description: assessment.description,
          maxScore: assessment.maxScore,
          period: assessment.period,
          examDate: assessment.examDate,
          teacherName: assessment.teacher.name,
          subjectName: assessment.teacher.subjectName,
        }));

      localStorage.setItem('assessment', JSON.stringify(filteredAssessments));
      console.log('수행평가 데이터 저장 완료');
    } catch (err) {
      console.error('수행 데이터 가져오기 오류:', err);
      setErrorState('수행평가 데이터를 가져오는 중 문제가 발생했습니다.');
    } finally {
      setLoadingState({ isLoading: false, message: '' });
    }
  }, [isAuthenticated]);

  // 시간표 데이터 가져오기
  const fetchTimetable = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoadingState({ isLoading: true, message: '시간표 로딩중...' });

    try {
      const response = await fetch(
        'https://hamster-server.vercel.app/api/v1/timetable/api/timetable?schoolCode=62573',
      );

      if (!response.ok)
        throw new Error(`시간표 데이터 가져오기 실패: ${response.status}`);

      const timetableData = await response.json();
      const userGrade = localStorage.getItem('grade');
      const userClass = localStorage.getItem('class');

      if (!userGrade || !userClass) throw new Error('사용자 학년/반 정보 없음');

      const filteredTimetable = timetableData[userGrade]?.[userClass];

      if (filteredTimetable) {
        localStorage.setItem('timetable', JSON.stringify(filteredTimetable));
        localStorage.setItem('timetableLastUpdated', new Date().toISOString());
        return true;
      } else {
        throw new Error('해당 학년/반의 시간표 데이터가 없습니다');
      }
    } catch (err) {
      console.error('시간표 데이터 오류:', err);
      setErrorState('시간표 데이터를 가져오는 중 문제가 발생했습니다.');
      return false;
    }
  }, [isAuthenticated]);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  interface SchoolScheduleHead {
    list_total_count: number;
    RESULT?: {
      CODE: string;
      MESSAGE: string;
    };
  }

  interface SchoolEvent {
    ATPT_OFCDC_SC_CODE: string;
    SD_SCHUL_CODE: string;
    AY: string;
    AA_YMD: string;
    ATPT_OFCDC_SC_NM: string;
    SCHUL_NM: string;
    DGHT_CRSE_SC_NM: string;
    SCHUL_CRSE_SC_NM: string;
    EVENT_NM: string;
    EVENT_CNTNT: string;
    ONE_GRADE_EVENT_YN: string;
    TW_GRADE_EVENT_YN: string;
    THREE_GRADE_EVENT_YN: string;
    FR_GRADE_EVENT_YN: string;
    FIV_GRADE_EVENT_YN: string;
    SIX_GRADE_EVENT_YN: string;
    SBTR_DD_SC_NM: string;
    LOAD_DTM: string;
  }

  interface SchoolScheduleData {
    SchoolSchedule: [{ head: SchoolScheduleHead[] }, { row: SchoolEvent[] }];
  }

  interface FilteredEvent {
    SBTR_DD_SC_NM: string; // 종류
    EVENT_NM: string; // 이름
    AA_YMD: string; // 날짜
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchScheduleData = useCallback(async () => {
    try {
      setLoadingState({ isLoading: true, message: '일정 로딩중...' });
      const url = `https://open.neis.go.kr/hub/SchoolSchedule?KEY=${
        import.meta.env.VITE_NICE_API
      }&Type=json&ATPT_OFCDC_SC_CODE=J10&SD_SCHUL_CODE=7751015&AA_YMD=${year}${month
        .toString()
        .padStart(2, '0')}`;

      const response = await fetch(url);
      const result: SchoolScheduleData = await response.json();

      if (result.SchoolSchedule[0].head[1].RESULT!.CODE === 'INFO-000') {
        // 데이터에서 row 배열 가져오기
        const events = result.SchoolSchedule[1].row;

        let grade: string = 'ONE_GRADE_EVENT_YN';
        switch (Number(localStorage.getItem('grade'))) {
          case 1:
            break;
          case 2:
            grade = 'TW_GRADE_EVENT_YN';
            break;
          case 3:
            grade = 'THREE_GRADE_EVENT_YN';
            break;
        }

        // 학년에 맞는 일정만 필터링
        const filteredEvents: FilteredEvent[] = events
          .filter((event: any) => event[grade] === 'Y')
          .map((event) => ({
            SBTR_DD_SC_NM: event.SBTR_DD_SC_NM, // 종류
            EVENT_NM: event.EVENT_NM, // 이름
            AA_YMD: event.AA_YMD, // 날짜
          }));
        localStorage.setItem('calendar', JSON.stringify(filteredEvents));
      } else {
        console.error('일정 데이터를 가져오는데 실패했습니다.');
      }
    } catch (error) {
      setErrorState('일정 데이터를 가져오는데 실패했습니다.');
      console.error('API 요청 중 오류 발생:', error);
    }
  }, []);

  // 사용자 데이터가 로드되면 localStorage에 개별 필드로 저장
  // 사용자 데이터 로드 및 저장
  useEffect(() => {
    if (!isAuthenticated) {
      setLoadingState({ isLoading: false, message: '' });
      return;
    }

    type StudentInfo = {
      grade: number;
      classNum: number;
      number: number;
    };

    if (localStorage.getItem('name')) {
      // 사용자 데이터 저장 성공 시 추가 데이터 로드
      Promise.all([
        fetchTimetable(),
        fetchAssessments(),
        fetchScheduleData(),
      ]).finally(() => {
        setLoadingState({ isLoading: false, message: '' });
      });
    }
  }, [
    isAuthenticated,
    cookies,
    fetchTimetable,
    fetchAssessments,
    fetchScheduleData,
  ]);

  const ProtectedRoute = ({ children }: any) => {
    if (!isAuthenticated) {
      return <Navigate to='/login' replace />;
    }

    if (loadingState.isLoading) {
      return <Spinner isLoading={true} text={loadingState.message} />;
    }

    if (errorState) {
      return <ErrorMessage message={errorState} />;
    }

    return children;
  };

  return (
    <div className='app'>
      {loadingState.isLoading && (
        <Spinner isLoading={true} text={loadingState.message} />
      )}

      <Routes>
        <Route path='install' element={<InstallPrompt />} />
        {/* 공개 라우트 */}
        <Route
          path='login'
          element={<PWAProtectedRoute element={<Login />} />}
        />
        <Route
          path='policy'
          element={<PWAProtectedRoute element={<Policy />} />}
        />

        {/* 보호된 라우트 */}
        <Route
          path='/'
          element={
            <PWAProtectedRoute
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
          }
        />
        <Route
          path='timetable'
          element={
            <PWAProtectedRoute
              element={
                <ProtectedRoute>
                  <Timetable />
                </ProtectedRoute>
              }
            />
          }
        />
        <Route
          path='/assessment/:id'
          element={
            <PWAProtectedRoute
              element={
                <ProtectedRoute>
                  <AssessmentDetailPage />
                </ProtectedRoute>
              }
            />
          }
        />
        <Route
          path='mypage'
          element={
            <PWAProtectedRoute
              element={
                <ProtectedRoute>
                  <MyPage />
                </ProtectedRoute>
              }
            />
          }
        />
        <Route
          path='schedule'
          element={
            <PWAProtectedRoute
              element={
                <ProtectedRoute>
                  <Calendar month={new Date().getMonth() + 1} />
                </ProtectedRoute>
              }
            />
          }
        />
        <Route
          path='menu'
          element={
            <PWAProtectedRoute
              element={
                <ProtectedRoute>
                  <Menu />
                </ProtectedRoute>
              }
            />
          }
        />
      </Routes>

      {isAuthenticated && <Navigation active={currentPath} />}
    </div>
  );
}

export default App;
