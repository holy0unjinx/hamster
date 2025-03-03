import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [credentials, setCredentials] = useState({
    studentNumber: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const response = await fetch(
        'https://hamster-server.vercel.app/api/v1/auth/student/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        },
      );

      if (!response.ok) {
        throw new Error('로그인 실패: 잘못된 계정 정보');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token); // 토큰 저장
      navigate('/'); // 메인 페이지로 리다이렉트
    } catch (err: any) {
      setError(err.message);
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
      <Link to='/register'>계정이 있나용?</Link>
    </div>
  );
}

export default Login;
