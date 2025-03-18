import React, { useState, useEffect } from 'react';
import {
  IoChevronForward,
  IoPersonCircle,
  IoSchool,
  IoCalendar,
  IoIdCard,
  IoLogOut,
} from 'react-icons/io5';
import { Link } from 'react-router-dom';
import '../styles/mypage.scss';
import { useCookies } from 'react-cookie';
import Spinner from '@/components/Spinner';

function MyPage() {
  const [userInfo, setUserInfo] = useState({
    userId: '',
    studentNumber: '',
    name: '',
    grade: '',
    class: '',
    number: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [cookies, setCookie] = useCookies(['access-token', 'refresh-token']);

  useEffect(() => {
    // localStorage에서 사용자 정보 불러오기
    const userId = localStorage.getItem('userId');
    const studentNumber = localStorage.getItem('studentNumber');
    const name = localStorage.getItem('name');
    const grade = localStorage.getItem('grade');
    const class_ = localStorage.getItem('class');
    const number = localStorage.getItem('number');

    // 사용자 정보가 있는지 확인
    if (userId && studentNumber && name && grade && class_ && number) {
      setUserInfo({
        userId,
        studentNumber,
        name,
        grade,
        class: class_,
        number,
      });
    }

    setIsLoading(false);
  }, []);

  // 로그아웃 함수
  const handleLogout = async () => {
    setIsLoading(true);
    // localStorage에서 사용자 정보 삭제
    localStorage.removeItem('userId');
    localStorage.removeItem('studentNumber');
    localStorage.removeItem('name');
    localStorage.removeItem('grade');
    localStorage.removeItem('class');
    localStorage.removeItem('number');

    // 로그아웃 API 호출
    await fetch('https://hamster-server.vercel.app/api/v1/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

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

    // 로그인 페이지로 이동
    window.location.href = '/login';
  };

  return (
    <div className='mypage'>
      <header>
        <Link to='/'>
          <IoChevronForward /> 홈으로
        </Link>
        <button className='right' onClick={handleLogout}>
          <IoLogOut />
        </button>
      </header>

      <div className='box profile-box'>
        <div className='title'>
          <Link to='#'>
            내 프로필 <IoChevronForward />
          </Link>
        </div>
        <div className='profile-info'>
          <div className='profile-avatar'>
            <IoPersonCircle />
          </div>
          <h2>{userInfo.name}님</h2>
          <p className='student-info'>
            {userInfo.grade}학년 {userInfo.class}반 {userInfo.number}번
          </p>
        </div>
      </div>

      <div className='box'>
        <div className='title'>
          <Link to='#'>
            학생 정보 <IoChevronForward />
          </Link>
        </div>
        <div className='info-list'>
          <div className='info-item'>
            <div className='icon'>
              <IoIdCard />
            </div>
            <div className='content'>
              <div className='head'>학번</div>
              <div className='value'>{userInfo.studentNumber}</div>
            </div>
          </div>

          <div className='info-item'>
            <div className='icon'>
              <IoSchool />
            </div>
            <div className='content'>
              <div className='head'>학년/반/번호</div>
              <div className='value'>
                {userInfo.grade}학년 {userInfo.class}반 {userInfo.number}번
              </div>
            </div>
          </div>

          <div className='info-item'>
            <div className='icon'>
              <IoPersonCircle />
            </div>
            <div className='content'>
              <div className='head'>이름</div>
              <div className='value'>{userInfo.name}</div>
            </div>
          </div>

          <div className='info-item'>
            <div className='icon'>
              <IoCalendar />
            </div>
            <div className='content'>
              <div className='head'>사용자 ID</div>
              <div className='value'>#{userInfo.userId}</div>
            </div>
          </div>
        </div>
      </div>

      <div className='box'>
        <div className='title'>
          <Link to='#'>
            계정 관리 <IoChevronForward />
          </Link>
        </div>
        <div className='account-actions'>
          <button className='action-button'>비밀번호 변경</button>
          <button className='action-button logout' onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      </div>

      <Spinner isLoading={isLoading} text='로그아웃 중...' />
    </div>
  );
}

export default MyPage;
