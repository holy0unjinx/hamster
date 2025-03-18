import React, { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Timetable from './pages/Timetable';
import Calendar from './pages/Calendar';
import Menu from './pages/Menu';
import Login from './pages/auth/Login';
import { useCookies } from 'react-cookie';
import Spinner from './components/Spinner';
import { useAuthFetch } from './hooks/useAuthFetch';
import MyPage from './pages/MyPage';
import Policy from './pages/Policy';
import Register from './pages/auth/Register';

function App() {
  const location = useLocation();
  const currentPath = location.pathname.slice(1) || 'home';
  const [cookies] = useCookies(['access-token', 'refresh-token']);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);

  const checkAuth = () => {
    return !!cookies['refresh-token'];
  };

  // 인증된 상태일 때 사용자 정보 가져오기
  const { data, loading, error } = useAuthFetch(
    'https://hamster-server.vercel.app/api/v1/student/me',
  );

  const fetchTimetable = async () => {
    if (!checkAuth()) return;

    try {
      // 로딩 상태 추가
      setIsLoadingUserData(true);

      const response = await fetch(
        'https://hamster-server.vercel.app/api/v1/timetable/api/timetable?schoolCode=62573',
      );

      if (!response.ok) {
        throw new Error(
          `시간표 데이터를 가져오는데 실패했습니다. 상태 코드: ${response.status}`,
        );
      }

      const timetableData = await response.json();

      if (timetableData) {
        // 사용자 학년과 반에 해당하는 시간표 데이터만 필터링
        const userGrade = localStorage.getItem('grade');
        const userClass = localStorage.getItem('class');

        if (!userGrade || !userClass) {
          throw new Error('사용자 학년 또는 반 정보가 없습니다.');
        }

        const filteredTimetable = timetableData[userGrade]?.[userClass];

        if (filteredTimetable) {
          // 필터링된 시간표 데이터를 localStorage에 저장
          localStorage.setItem('timetable', JSON.stringify(filteredTimetable));
          localStorage.setItem(
            'timetableLastUpdated',
            new Date().toISOString(),
          );
          console.log(
            '사용자 학년과 반의 시간표 정보가 localStorage에 저장되었습니다.',
          );

          // 저장 확인
          const savedData = localStorage.getItem('timetable');
          if (!savedData) {
            console.error(
              '시간표 데이터가 localStorage에 저장되지 않았습니다.',
            );
          }
        } else {
          throw new Error(
            '사용자 학년과 반에 해당하는 시간표 데이터가 없습니다.',
          );
        }
      } else {
        throw new Error('시간표 데이터 형식이 올바르지 않습니다.');
      }
    } catch (err) {
      console.error('시간표 데이터 가져오기 오류:', err);
      // 오류 상태 관리를 위한 state 추가 필요
    } finally {
      setIsLoadingUserData(false);
    }
  };

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

  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
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
        console.error('API 요청 중 오류 발생:', error);
      }
    };
    fetchScheduleData();
  });

  // 사용자 데이터가 로드되면 localStorage에 개별 필드로 저장
  useEffect(() => {
    if (data && !loading && !error && data.success && data.data) {
      try {
        // 각 필드를 개별적으로 localStorage에 저장
        localStorage.setItem('userId', data.data.id.toString());
        localStorage.setItem(
          'studentNumber',
          data.data.studentNumber.toString(),
        );
        localStorage.setItem('name', data.data.name);
        localStorage.setItem('grade', data.data.grade.toString());
        localStorage.setItem('class', data.data.class.toString());
        localStorage.setItem('number', data.data.number.toString());

        console.log('사용자 정보가 localStorage에 저장되었습니다.');

        fetchTimetable();
      } catch (err) {
        console.error('localStorage 저장 중 오류 발생:', err);
      }
    }
  }, [data, loading, error]);

  // 로딩 상태 처리
  useEffect(() => {
    setIsLoadingUserData(loading && checkAuth());
  }, [loading]);

  const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const isAuthenticated = checkAuth();

    if (!isAuthenticated) {
      return <Navigate to='/login' replace />;
    }

    // 인증은 되었지만 사용자 데이터 로딩 중인 경우
    if (isLoadingUserData) {
      return <Spinner isLoading={true} text='불러오는 중...' />;
    }

    // 인증은 되었지만 API 오류가 발생한 경우
    if (error && checkAuth()) {
      return (
        <div className='error-message'>
          사용자 정보를 불러오는 중 오류가 발생했습니다: {error}
          <Link to='/login'>여기를 눌러 다시 로그인해주세요.</Link>
        </div>
      );
    }

    return children;
  };

  return (
    <div className='app'>
      {<Spinner isLoading={isLoadingUserData} text='로딩 중...' />}

      <Routes>
        <Route path='login' element={<Login />} />
        <Route path='register' element={<Register />} />
        <Route
          path='/'
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path='timetable'
          element={
            <ProtectedRoute>
              <Timetable />
            </ProtectedRoute>
          }
        />
        <Route
          path='mypage'
          element={
            <ProtectedRoute>
              <MyPage />
            </ProtectedRoute>
          }
        />

        <Route path='policy' element={<Policy />} />
        <Route
          path='schedule'
          element={
            <ProtectedRoute>
              <Calendar month={3} />
            </ProtectedRoute>
          }
        />
        <Route
          path='menu'
          element={
            <ProtectedRoute>
              <Menu />
            </ProtectedRoute>
          }
        />
      </Routes>

      {checkAuth() && <Navigation active={currentPath} />}
    </div>
  );
}

export default App;
