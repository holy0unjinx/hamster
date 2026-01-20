import React, { JSX, useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Spinner from './components/Spinner';

function App() {
  const [cookies] = useCookies(['access-token', 'refresh-token']);
  const [loadingState, setLoadingState] = useState({
    isLoading: true,
    message: '불러오는 중...',
  });
  const [userData, setUserData] = useState<any>({});
  const isAuthenticated = !!cookies['refresh-token'];

  // 사용자 데이터 저장 함수
  const saveUserData = useCallback((data: any) => {
    try {
      console.log(data);
      const id = String(data.id);
      localStorage.setItem('userId', id);
      return true;
    } catch (err) {
      console.error('사용자 데이터 저장 오류:', err);
      return false;
    }
  }, []);

  // 사용자 데이터 가져오기
  const fetchUserData = async () => {
    if (!isAuthenticated) return;

    try {
      setLoadingState({ isLoading: true, message: '사용자 정보 로딩중...' });
      const userId = localStorage.getItem('userId'); // 로컬스토리지에서 ID 가져오기
      const response = await fetch(
        `https://hamster-server.vercel.app/api/v1/teacher/me?id=${userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${cookies['access-token']}`,
          },
        },
      );

      const data = await response.json();
      setUserData(data);
      saveUserData(data.data); // 사용자 데이터 저장
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // 수행평가 데이터 가져오기
  const fetchAssessments = async () => {
    if (!isAuthenticated) return;

    try {
      setLoadingState({ isLoading: true, message: '수행평가 로딩중...' });
      const response = await fetch(
        'https://hamster-server.vercel.app/api/v1/assessment',
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        },
      );

      if (!response.ok) {
        throw new Error('수행평가 데이터를 가져오는데 실패했습니다.');
      }

      const assessmentData = await response.json();
      localStorage.setItem(
        'assessments',
        JSON.stringify(assessmentData.assessments),
      );
    } catch (err) {
      console.error('수행평가 조회 실패:', err);
    } finally {
      setLoadingState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // 컴포넌트 마운트 시 사용자 데이터 및 수행평가 데이터 가져오기
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData().then(() => fetchAssessments());
    }
  }, [isAuthenticated]);

  // 보호된 라우트 컴포넌트
  const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    if (!isAuthenticated) return <Navigate to='/login' replace />;
    if (loadingState.isLoading)
      return <Spinner isLoading text={loadingState.message} />;
    return children;
  };

  return (
    <Routes>
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route
        path='/'
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
