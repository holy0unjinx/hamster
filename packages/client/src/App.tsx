import React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Timetable from './pages/Timetable';
import Calendar from './pages/Calendar';
import Menu from './pages/Menu';
import Login from './pages/auth/Login';

function App() {
  const location = useLocation();
  const currentPath = location.pathname.slice(1) || 'home';
  const checkAuth = () => {
    const refreshToken = localStorage.getItem('refresh-token');
    const accessToken = localStorage.getItem('access-token');
    return !!refreshToken && !!accessToken;
  };
  const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const isAuthenticated = checkAuth();

    if (!isAuthenticated) {
      return <Navigate to='/login' replace />;
    }

    return children;
  };

  return (
    <div className='app'>
      <Routes>
        <Route path='/login' element={<Login />} /> {/* 로그인 라우트 추가 */}
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
