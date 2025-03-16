import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import '../../styles/login.scss';
import Spinner from '@/components/Spinner';

function Login() {
  const [credentials, setCredentials] = useState({
    studentNumber: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가
  const navigate = useNavigate();
  const [cookies, setCookie] = useCookies(['access-token', 'refresh-token']);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // 로딩 시작

    try {
      const response = await fetch(
        'https://hamster-server.vercel.app/api/v1/auth/student/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(credentials),
        },
      );

      if (!response.ok) {
        throw new Error('로그인 실패: 잘못된 계정 정보');
      }

      const result = await response.json();

      // 올바른 속성으로 쿠키 설정
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

      window.location.href = '/';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false); // 로딩 종료
    }
  };

  const handleChange = (e: any) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className='login-form'>
      <div className='title'>로그인</div>
      <form onSubmit={handleSubmit}>
        <input
          type='text'
          name='studentNumber'
          placeholder='학번'
          onChange={handleChange}
          required
        />
        <input
          type='password'
          name='password'
          placeholder='비밀번호'
          onChange={handleChange}
          required
        />
        {error && <div className='error-message'>{error}</div>}
        <input type='submit' value='로그인' />
      </form>
      <Link to='/register'>계정이 없으신가요?</Link>

      {/* 스피너 컴포넌트 추가 */}
      <Spinner isLoading={isLoading} text='로그인 중...' />
    </div>
  );
}

export default Login;
