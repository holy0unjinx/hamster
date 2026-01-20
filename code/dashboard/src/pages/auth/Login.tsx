import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import '../../styles/login.scss';

export default function Login() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [cookies, setCookie] = useCookies(['access-token', 'refresh-token']);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(
        'https://hamster-server.vercel.app/api/v1/auth/teacher/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        },
      );

      if (!res.ok) throw new Error('로그인 실패');

      const { data } = await res.json();
      setCookie('access-token', data.accessToken, { path: '/' });
      setCookie('refresh-token', data.refreshToken, { path: '/' });
      // 로그인 시 userId 저장
      localStorage.setItem('userId', data.data.toString());
      window.location.href = '/';
    } catch (err) {
      setError('이메일 또는 비밀번호가 잘못되었습니다');
    }
  };

  return (
    <div className='auth-container'>
      <h1>교사 로그인</h1>
      <form onSubmit={handleSubmit}>
        <input
          type='text'
          placeholder='이메일'
          value={credentials.email}
          onChange={(e) =>
            setCredentials({ ...credentials, email: e.target.value })
          }
          required
        />
        <input
          type='password'
          placeholder='비밀번호'
          value={credentials.password}
          onChange={(e) =>
            setCredentials({ ...credentials, password: e.target.value })
          }
          required
        />
        {error && <div className='error-message'>{error}</div>}
        <button type='submit'>로그인</button>
        <a href='/register' className='register'>
          가입하기
        </a>
      </form>
    </div>
  );
}
