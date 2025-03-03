import { Link } from 'react-router-dom';

function Login() {
  return (
    <div className='login-form'>
      <div className='title'>로그인</div>
      <input type='text' />
      <input type='password' />
      <input type='submit' value='' />
      <Link to='register'>계정이 있나용?</Link>
    </div>
  );
}

// import { Link } from 'react-router-dom';

// function Login() {
//   return (
//     <div className='login-form'>
//       <div className='title'>로그인</div>
//       <input type='text' />
//       <input type='password' />
//       <input type='submit' value='로그인' />
//       <Link to='register'>계정이 있나용?</Link>
//     </div>
//   );
// }

// export default Login;

// 자 이거 적당이 로직 짜봐, /api/auth/student/login으로 요청하면 됨
export default Login;
