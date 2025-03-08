import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Timetable from './pages/Timetable';
import Calendar from './pages/Calendar';
import Menu from './pages/Menu';
import Login from './pages/auth/Login';
import { useCookies } from 'react-cookie';
import Spinner from './components/Spinner';
import { useAuthFetch } from './hooks/useAuthFetch';

// 학생 정보 인터페이스 정의
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

function App() {
  const location = useLocation();
  const currentPath = location.pathname.slice(1) || 'home';
  const [cookies] = useCookies(['access-token', 'refresh-token']);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);

  const checkAuth = () => {
    return !!cookies['refresh-token'] && !!cookies['access-token'];
  };

  // 인증된 상태일 때 사용자 정보 가져오기
  const { data, loading, error } = useAuthFetch(
    'https://hamster-server.vercel.app/api/v1/student/me',
    { skip: !checkAuth() },
  );

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
      return <Spinner isLoading={true} />;
    }

    // 인증은 되었지만 API 오류가 발생한 경우
    if (error && checkAuth()) {
      return (
        <div className='error-message'>
          사용자 정보를 불러오는 중 오류가 발생했습니다: {error}
        </div>
      );
    }

    return children;
  };

  return (
    <div className='app'>
      {isLoadingUserData && <Spinner isLoading={true} />}

      <Routes>
        <Route path='/login' element={<Login />} />
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
