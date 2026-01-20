import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import '../../styles/login.scss';
import Spinner from '../../components/Spinner';

function Login() {
  const [credentials, setCredentials] = useState({
    studentNumber: '',
    name: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가
  const [cookies, setCookie] = useCookies(['student-number', 'name']);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // 로딩 시작

    try {
      setCookie('student-number', credentials.studentNumber, {
        path: '/',
        secure: true,
        sameSite: 'none',
        maxAge: 30 * 24 * 60 * 60,
      });
      localStorage.setItem('studentNumber', credentials.studentNumber);

      localStorage.setItem('name', credentials.name);
      function parseStudentId(studentId: string) {
        if (studentId.length !== 5) {
          throw new Error('학생 ID는 5자리여야 합니다.');
        }

        // 각각 숫자로 변환하여 반환
        const grade = parseInt(studentId.slice(0, 1), 10);
        const classNum = parseInt(studentId.slice(1, 3), 10);
        const number = parseInt(studentId.slice(3, 5), 10);

        return {
          grade,
          classNum,
          number,
        };
      }
      const { grade, classNum, number } = parseStudentId(
        credentials.studentNumber,
      );
      localStorage.setItem('grade', grade.toString());
      localStorage.setItem('class', classNum.toString());
      localStorage.setItem('number', number.toString());

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
          type='text'
          name='name'
          placeholder='이름'
          onChange={handleChange}
          required
        />
        {error && <div className='error-message'>{error}</div>}
        <input type='submit' value='로그인' />
      </form>

      {/* 스피너 컴포넌트 추가 */}
      <Spinner isLoading={isLoading} text='로그인 중...' />
    </div>
  );
}

export default Login;
