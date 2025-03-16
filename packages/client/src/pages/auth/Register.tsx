import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/register.scss';
import Spinner from '@/components/Spinner';

function Register() {
  const [step, setStep] = useState(1); // 현재 단계 (1: 환영, 2: 학번/이름, 3: 비밀번호, 4: 정책 동의)
  const [userData, setUserData] = useState({
    studentNumber: '',
    name: '',
    password: '',
    confirmPassword: '',
  });
  const [policyAgreements, setPolicyAgreements] = useState({
    termsOfService: false,
    privacyPolicy: false,
    dataUsage: false,
  });
  const [showPolicyContent, setShowPolicyContent] = useState({
    termsOfService: false,
    privacyPolicy: false,
    dataUsage: false,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // 다음 단계로 이동
  const nextStep = () => {
    if (step === 2) {
      // 학번과 이름 유효성 검사
      if (!userData.studentNumber || !userData.name) {
        setError('학번과 이름을 모두 입력해주세요.');
        return;
      }

      // 학번 형식 검사 (예: 10101 형식의 5자리 숫자)
      if (!/^\d{5}$/.test(userData.studentNumber)) {
        setError('올바른 학번 형식이 아닙니다.');
        return;
      }
    } else if (step === 3) {
      // 비밀번호 일치 여부 확인
      if (userData.password !== userData.confirmPassword) {
        setError('비밀번호가 일치하지 않습니다.');
        return;
      }

      // 비밀번호 유효성 검사 (최소 8자 이상)
      if (userData.password.length < 8) {
        setError('비밀번호는 최소 8자 이상이어야 합니다.');
        return;
      }
    }

    setError('');
    setStep(step + 1);
  };

  // 이전 단계로 이동
  const prevStep = () => {
    setError('');
    setStep(step - 1);
  };

  // 입력값 변경 처리
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  // 정책 동의 체크박스 변경 처리
  const handlePolicyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPolicyAgreements({
      ...policyAgreements,
      [e.target.name]: e.target.checked,
    });
  };

  // 모든 정책 동의 처리
  const handleAllPolicyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setPolicyAgreements({
      termsOfService: isChecked,
      privacyPolicy: isChecked,
      dataUsage: isChecked,
    });
  };

  // 정책 내용 토글
  const togglePolicyContent = (policy: string) => {
    setShowPolicyContent({
      ...showPolicyContent,
      [policy]: !showPolicyContent[policy as keyof typeof showPolicyContent],
    });
  };

  // 회원가입 제출 처리
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // 모든 정책에 동의했는지 확인
    if (!Object.values(policyAgreements).every((value) => value)) {
      setError('모든 정책에 동의해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        'https://hamster-server.vercel.app/api/v1/auth/student/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentNumber: userData.studentNumber,
            name: userData.name,
            password: userData.password,
          }),
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

  // 단계별 컴포넌트 렌더링
  const renderStep = () => {
    switch (step) {
      case 1: // 환영 인사
        return (
          <div className='welcome-step'>
            <h2>HAMS터에 오신 것을 환영합니다!</h2>
            <p>현암중학교 학생들을 위한 종합 학사관리 플랫폼입니다.</p>
            <p>간단한 회원가입 절차를 통해 서비스를 이용하실 수 있습니다.</p>
            <button onClick={nextStep} className='next-btn'>
              시작하기
            </button>
          </div>
        );

      case 2: // 학번, 이름 입력
        return (
          <div className='info-step'>
            <h2>기본 정보 입력</h2>
            <div className='input-group'>
              <input
                type='text'
                name='studentNumber'
                placeholder='학번 (5자리)'
                value={userData.studentNumber}
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
            {error && <div className='error-message'>{error}</div>}
            <div className='button-group'>
              <button onClick={prevStep} className='prev-btn'>
                이전
              </button>
              <button onClick={nextStep} className='next-btn'>
                다음
              </button>
            </div>
          </div>
        );

      case 3: // 비밀번호 입력
        return (
          <div className='password-step'>
            <h2>비밀번호 설정</h2>
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
            {error && <div className='error-message'>{error}</div>}
            <div className='button-group'>
              <button type='button' onClick={prevStep} className='prev-btn'>
                이전
              </button>
              <button type='button' onClick={nextStep} className='next-btn'>
                다음
              </button>
            </div>
          </div>
        );

      case 4: // 정책 동의
        return (
          <div className='policy-step'>
            <h2>이용약관 동의</h2>
            <form onSubmit={handleSubmit}>
              <div className='policy-container'>
                <div className='all-agree'>
                  <div className='checkbox-wrapper'>
                    <input
                      type='checkbox'
                      id='all-agree'
                      checked={Object.values(policyAgreements).every(
                        (value) => value,
                      )}
                      onChange={handleAllPolicyChange}
                    />
                  </div>
                  <label htmlFor='all-agree' className='all-agree-text'>
                    모든 약관에 동의합니다
                  </label>
                </div>

                <div className='policy-item'>
                  <div className='policy-header'>
                    <div className='checkbox-wrapper'>
                      <input
                        type='checkbox'
                        id='terms-of-service'
                        name='termsOfService'
                        checked={policyAgreements.termsOfService}
                        onChange={handlePolicyChange}
                        required
                      />
                    </div>
                    <label htmlFor='terms-of-service' className='policy-title'>
                      서비스 이용약관 (필수)
                    </label>
                    <button
                      type='button'
                      className='policy-toggle'
                      onClick={() => togglePolicyContent('termsOfService')}
                    >
                      {showPolicyContent.termsOfService ? '접기' : '보기'}
                    </button>
                  </div>
                  {showPolicyContent.termsOfService && (
                    <div className='policy-content'>
                      HAMS터 서비스 이용약관입니다. 본 약관은 현암중학교
                      학생들의 학사관리 서비스 이용에 관한 제반 사항을
                      규정합니다. 서비스 이용 시 개인정보 보호, 서비스 이용
                      규칙, 책임 제한 등에 관한 내용을 포함하고 있습니다.
                    </div>
                  )}
                </div>

                <div className='policy-item'>
                  <div className='policy-header'>
                    <div className='checkbox-wrapper'>
                      <input
                        type='checkbox'
                        id='privacy-policy'
                        name='privacyPolicy'
                        checked={policyAgreements.privacyPolicy}
                        onChange={handlePolicyChange}
                        required
                      />
                    </div>
                    <label htmlFor='privacy-policy' className='policy-title'>
                      개인정보 처리방침 (필수)
                    </label>
                    <button
                      type='button'
                      className='policy-toggle'
                      onClick={() => togglePolicyContent('privacyPolicy')}
                    >
                      {showPolicyContent.privacyPolicy ? '접기' : '보기'}
                    </button>
                  </div>
                  {showPolicyContent.privacyPolicy && (
                    <div className='policy-content'>
                      HAMS터 개인정보 처리방침입니다. 본 서비스는 학생의 학번,
                      이름, 비밀번호 등의 개인정보를 수집합니다. 수집된
                      개인정보는 서비스 제공 및 학사관리 목적으로만 사용되며,
                      법적 근거 없이 제3자에게 제공되지 않습니다.
                    </div>
                  )}
                </div>

                <div className='policy-item'>
                  <div className='policy-header'>
                    <div className='checkbox-wrapper'>
                      <input
                        type='checkbox'
                        id='data-usage'
                        name='dataUsage'
                        checked={policyAgreements.dataUsage}
                        onChange={handlePolicyChange}
                        required
                      />
                    </div>
                    <label htmlFor='data-usage' className='policy-title'>
                      데이터 이용 동의 (필수)
                    </label>
                    <button
                      type='button'
                      className='policy-toggle'
                      onClick={() => togglePolicyContent('dataUsage')}
                    >
                      {showPolicyContent.dataUsage ? '접기' : '보기'}
                    </button>
                  </div>
                  {showPolicyContent.dataUsage && (
                    <div className='policy-content'>
                      HAMS터 서비스는 학사관리를 위해 학생의 성적, 수행평가,
                      시간표 등의 데이터를 수집하고 처리합니다. 이 데이터는 학생
                      개인의 학습 관리 및 성적 분석을 위해 사용되며, 서비스
                      개선을 위한 통계 자료로 활용될 수 있습니다.
                    </div>
                  )}
                </div>
              </div>

              {error && <div className='error-message'>{error}</div>}
              <div className='button-group'>
                <button type='button' onClick={prevStep} className='prev-btn'>
                  이전
                </button>
                <button type='submit' className='submit-btn'>
                  가입 완료
                </button>
              </div>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className='register-container'>
      <div className='register-form'>
        <div className='progress-bar'>
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className='progress-line'></div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2</div>
          <div className='progress-line'></div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>3</div>
          <div className='progress-line'></div>
          <div className={`progress-step ${step >= 4 ? 'active' : ''}`}>4</div>
        </div>

        {renderStep()}

        <div className='login-link'>
          <Link to='/login'>이미 계정이 있으신가요?</Link>
        </div>
      </div>

      <Spinner isLoading={isLoading} text='회원가입 중...' />
    </div>
  );
}

export default Register;
