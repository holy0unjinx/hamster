import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/register.scss';
import Spinner from '../../components/Spinner';

function Register() {
  const [userData, setUserData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    teachersOffice: '',
    homeroomClass: '',
    subjectName: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 비밀번호 확인
    if (userData.password !== userData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      setIsLoading(false);
      return;
    }

    // 비밀번호 유효성 검사 (최소 8자 이상)
    if (userData.password.length < 8) {
      setError('비밀번호는 최소 8자 이상이어야 합니다.');
      setIsLoading(false);
      return;
    }

    try {
      // 회원가입 요청 데이터 준비
      const requestData = {
        email: userData.email,
        password: userData.password,
        name: userData.name,
        teachersOffice: userData.teachersOffice,
        subjectName: userData.subjectName,
      };

      // 담임 반이 있는 경우에만 추가
      if (userData.homeroomClass.trim() !== '') {
        Object.assign(requestData, { homeroomClass: userData.homeroomClass });
      }

      const response = await fetch(
        'https://hamster-server.vercel.app/api/v1/auth/teacher/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '회원가입에 실패했습니다.');
      }

      // 회원가입 성공 시 로그인 페이지로 이동
      navigate('/login', {
        state: { message: '회원가입이 완료되었습니다. 로그인해주세요.' },
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='register-container'>
      <div className='register-form'>
        <h2>교사 회원가입</h2>
        <form onSubmit={handleSubmit}>
          <div className='input-group'>
            <input
              type='text'
              name='email'
              placeholder='이메일'
              value={userData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className='input-group'>
            <input
              type='password'
              name='password'
              placeholder='비밀번호 (8자 이상)'
              value={userData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className='input-group'>
            <input
              type='password'
              name='confirmPassword'
              placeholder='비밀번호 확인'
              value={userData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className='input-group'>
            <input
              type='text'
              name='name'
              placeholder='이름'
              value={userData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className='input-group'>
            <input
              type='text'
              name='teachersOffice'
              placeholder='교무실 위치'
              value={userData.teachersOffice}
              onChange={handleChange}
              required
            />
          </div>
          <div className='input-group'>
            <input
              type='text'
              name='homeroomClass'
              placeholder='담임 반 (없을 시 비워두세요)'
              value={userData.homeroomClass}
              onChange={handleChange}
            />
          </div>
          <div className='input-group'>
            <input
              type='text'
              name='subjectName'
              placeholder='과목명'
              value={userData.subjectName}
              onChange={handleChange}
              required
            />
          </div>

          {error && <div className='error-message'>{error}</div>}

          <button type='submit' className='submit-btn'>
            가입하기
          </button>
        </form>

        <div className='login-link'>
          <Link to='/login'>이미 계정이 있으신가요?</Link>
        </div>
      </div>

      <Spinner isLoading={isLoading} text='회원가입 중...' />
    </div>
  );
}

export default Register;
