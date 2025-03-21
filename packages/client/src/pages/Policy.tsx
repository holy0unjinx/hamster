import React from 'react';
import '../styles/policy.scss';

const Policy = () => {
  return (
    <div className='policy-container'>
      <h1>1. 개인정보 보호정책 (Privacy Policy)</h1>

      <p>
        HAMS터 앱 (이하 '본 사이트')은 현암중학교 학생들을 위한 종합 학사관리
        서비스로, 사용자의 개인정보를 중요하게 생각합니다. 본 개인정보
        보호정책은 당사가 수집하는 정보의 유형, 사용 방법, 보호 방안에 대해
        안내합니다.
      </p>

      <h2>수집하는 개인정보</h2>

      <div className='policy-section'>
        <h3>기본 정보</h3>
        <ul>
          <li>학번</li>
          <li>이름</li>
          <li>학년, 반, 번호</li>
          <li>생년월일 (선택)</li>
        </ul>
        <h3>계정 정보</h3>
        <ul>
          <li>비밀번호 (해시 처리되어 저장)</li>
        </ul>

        <h3>시스템 정보</h3>
        <ul>
          <li>로그인 시간</li>
          <li>앱 사용 기록</li>
          <li>IP 주소 및 기기 정보</li>
        </ul>

        <h3>알림 구독 정보</h3>
        <ul>
          <li>웹 푸시 알림을 위한 엔드포인트</li>
          <li>p256dh, auth 키</li>
        </ul>
      </div>

      <h2>개인정보 수집 및 이용 목적</h2>

      <p>본 사이트는 다음과 같은 목적으로 개인정보를 수집하고 이용합니다:</p>

      <ol>
        <li>사용자 인증 및 계정 관리</li>
        <li>학사 일정 및 수행평가 정보 제공</li>
        <li>맞춤형 알림 서비스 제공</li>
        <li>서비스 개선 및 오류 수정</li>
      </ol>

      <h2>개인정보 이용 방법</h2>

      <ul>
        <li>학생 정보는 학사 관리 및 성적 관리 목적으로만 사용됩니다.</li>
        <li>
          수집된 데이터는 현암중학교 학생들을 위한 종합 학사관리 서비스 제공에
          활용됩니다.
        </li>
      </ul>

      <h2>개인정보 보관 및 파기</h2>

      <div className='policy-section'>
        <h3>보관 기간</h3>
        <ul>
          <li>학생 정보의 보존 기간은 현 전교회장의 집권 시기입니다.</li>
          <li>임기가 끝날 시 모든 사용자의 정보는 파기될 예정입니다.</li>
        </ul>

        <h3>파기 절차</h3>
        <ul>
          <li>개인 요청에 따라 개인정보를 삭제할 수 있습니다.</li>
          <li>보존 기간이 경과한 개인정보는 지체 없이 파기합니다.</li>
        </ul>
      </div>

      <h2>개인정보 제3자 제공</h2>

      <p>
        원칙적으로 본 사이트는 이용자의 개인정보를 본 개인정보 처리방침에서
        명시한 범위 내에서만 처리하며, 다음의 경우를 제외하고는 이용자의 사전
        동의 없이 개인정보를 제3자에게 제공하지 않습니다:
      </p>

      <ul>
        <li>
          법률에 특별한 규정이 있거나 법령상 의무를 준수하기 위해 불가피한 경우
        </li>
        <li>
          서비스 제공을 위해 Vercel, Neon Serverless Postgres와 같은 인프라
          서비스를 이용하며, 이 과정에서 데이터가 해당 서비스에 저장될 수
          있습니다.
        </li>
      </ul>

      <h2>개인정보의 안전성 확보 조치</h2>
      <div className='highlight-info'>
        <p>
          본 사이트는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고
          있습니다:
        </p>

        <ul>
          <li>
            <strong>암호화</strong>: AES-256 암호화 기술을 사용하여 중요
            데이터를 보호합니다.
          </li>
          <li>
            <strong>비밀번호 보호</strong>: 비밀번호는 반드시 해시 처리되어
            저장됩니다.
          </li>
          <li>
            <strong>안전한 인증 시스템</strong>: JWT(JSON Web Token)를 사용한
            안전한 인증 시스템을 구현합니다.
          </li>
        </ul>
      </div>

      <h2>이용자 및 법정대리인의 권리와 행사 방법</h2>

      <div className='highlight-info'>
        <p>
          이용자 및 법정대리인은 언제든지 요청하면 등록되어 있는 자신의
          개인정보를 조회하거나 수정할 수 있으며, 개인정보 처리를 중단하거나
          삭제를 요청할 수 있습니다.
        </p>
      </div>

      <h2>개인정보 보호책임자</h2>

      <div className='contact-info'>
        <ul>
          <li>개인정보 보호책임자: 신성은진</li>
          <li>연락처: holy9unjinx@gmail.com</li>
          <li>위치: 현암중학교 4층 학생회실</li>
        </ul>
      </div>

      <h2>개인정보 처리방침 변경</h2>

      <p>
        본 개인정보 처리방침은 법령, 정책 또는 보안기술의 변경에 따라 내용의
        추가, 삭제 및 수정이 있을 시에는 변경사항의 시행 7일 전부터 앱 내
        공지사항을 통해 고지할 것입니다.
      </p>

      <ul>
        <li>
          <span className='date-info'>공고일자</span>2025년 3월 16일
        </li>
        <li>
          <span className='date-info'>시행일자</span>2025년 3월 16일
        </li>
      </ul>

      <h1>2. 이용약관 (Terms and Conditions)</h1>

      <p>
        HAMS터 앱(이하 '본 사이트')은 현암중학교 학생들을 위한 종합 학사관리
        플랫폼입니다. 본 이용약관은 서비스 이용에 관한 규칙과 사용자의 권리 및
        의무를 규정합니다.
      </p>

      <h2>서비스 개요</h2>

      <p>
        본 사이트는 수행평가 관리, 학사일정 확인, 시간표 관리, 내신 성적 계산
        등의 기능을 제공하는 현암중학교 학생 전용 서비스입니다.
      </p>

      <h2>서비스 이용 규칙</h2>

      <div className='policy-section'>
        <h3>계정 관리</h3>
        <ul>
          <li>
            서비스 이용을 위해서는 현암중학교 학생임을 인증하는 절차가
            필요합니다.
          </li>
          <li>
            사용자는 자신의 계정 정보를 타인과 공유해서는 안 되며, 계정 보안에
            대한 책임이 있습니다.
          </li>
          <li>타인의 계정을 무단으로 사용하는 행위는 금지됩니다.</li>
        </ul>

        <h3>콘텐츠 이용</h3>
        <ul>
          <li>
            서비스 내 제공되는 콘텐츠(시간표, 학사일정 등)는 개인적 용도로만
            사용해야 합니다.
          </li>
          <li>
            서비스에서 제공하는 정보를 무단으로 수정, 배포, 판매하는 행위는
            금지됩니다.
          </li>
          <li>
            사용자가 서비스에 업로드한 콘텐츠에 대한 저작권은 해당 사용자에게
            있으나, 서비스 운영을 위해 필요한 범위 내에서 이를 사용할 권한을 본
            사이트에 부여합니다.
          </li>
        </ul>
      </div>

      <h2>위반 시 제재 조치</h2>

      <p>이용약관을 위반할 경우 다음과 같은 제재 조치가 적용될 수 있습니다:</p>

      <ul>
        <li>경고 조치</li>
        <li>일시적 서비스 이용 제한</li>
        <li>영구적 서비스 이용 제한</li>
        <li>
          심각한 위반 사항은 학교 측에 보고될 수 있으며, 학교 규정에 따른 추가
          제재가 있을 수 있습니다.
        </li>
        <li>
          불법적인 행위에 대해서는 관련 법규에 따라 법적 조치가 취해질 수
          있습니다.
        </li>
      </ul>

      <h2>서비스 변경 및 종료</h2>

      <ul>
        <li>본 사이트는 서비스 내용을 사전 공지 후 변경할 수 있습니다.</li>
        <li>
          불가피한 사유로 서비스가 종료될 경우, 최소 30일 전에 공지합니다.
        </li>
        <li>
          서비스 종료 시 사용자 데이터 처리 방침은 개인정보 보호정책에 따릅니다.
        </li>
      </ul>

      <h1>3. 앱 보안 및 보호 정책</h1>

      <p>
        본 사이트는 사용자 데이터의 보안과 안전한 서비스 제공을 위해 다음과 같은
        보안 및 보호 정책을 시행합니다.
      </p>

      <h2>데이터 보호</h2>

      <div className='highlight-info'>
        <ul>
          <li>모든 사용자 데이터는 암호화되어 저장됩니다.</li>
          <li>
            개인정보 및 학업 데이터는 권한이 있는 사용자만 접근할 수 있도록
            제한됩니다.
          </li>
          <li>
            서비스는 정기적인 보안 점검을 통해 데이터 유출 위험을 최소화합니다.
          </li>
        </ul>
      </div>

      <h2>보안 위협 감지 및 대응</h2>

      <ul>
        <li>
          데이터 유출 의심 상황 발생 시, 즉시 관련 사용자에게 통보하고 필요한
          조치를 취합니다.
        </li>
        <li>
          보안 취약점 발견 시 신속하게 패치를 적용하여 위험을 최소화합니다.
        </li>
      </ul>

      <h2>보안 수준별 정책</h2>

      <div className='policy-section'>
        <h3>기본 정책</h3>
        <p>
          일반적인 서비스 이용에 적용되는 보안 정책으로, 기본적인 암호화와 접근
          제어를 포함합니다.
        </p>

        <h3>강화 정책</h3>
        <p>
          성적 정보 등 민감한 데이터에 접근할 때 적용되는 정책으로, 추가 인증
          절차가 요구됩니다.
        </p>
      </div>

      <h2>데이터 접근 제어</h2>

      <ul>
        <li>
          앱 실행 시 로그인 인증이 필요하며, 일정 시간 미사용 시 자동
          로그아웃됩니다.
        </li>
        <li>
          민감한 정보(성적, 개인정보 등)에 접근할 때는 추가 인증이 요구될 수
          있습니다.
        </li>
      </ul>

      <h2>데이터 공유 제한</h2>

      <div className='policy-section'>
        <ul>
          <li>
            성적 정보 및 개인정보는 앱 외부로의 복사 및 공유가 제한될 수
            있습니다.
          </li>
          <li>
            서비스 내 데이터를 외부 앱으로 내보내기 위해서는 명시적 동의 절차가
            필요합니다.
          </li>
          <li>학교 관리자가 승인한 데이터만 외부 공유가 가능합니다.</li>
        </ul>
      </div>

      <h2>오프라인 데이터 보호</h2>

      <ul>
        <li>오프라인 상태에서 접근 가능한 데이터는 기기 내에서 저장됩니다.</li>
        <li>
          앱 데이터 삭제 시 기기에 저장된 모든 사용자 데이터는 완전히
          삭제됩니다.
        </li>
      </ul>

      <h2>정책 변경 및 공지</h2>

      <p>
        이 이용약관 및 보호 정책은 서비스 개선, 법률 변경 등의 이유로 수정될 수
        있습니다. 중요한 변경사항이 있을 경우 서비스 내 공지사항을 통해
        안내하며, 변경된 정책은 공지일로부터 14일 후 효력이 발생합니다.
      </p>

      <div className='highlight-info'>
        <p>
          본 약관에 동의함으로써 사용자는 본 사이트의 모든 정책을 이해하고
          준수할 것을 약속합니다.
        </p>
      </div>

      <ul>
        <li>
          <span className='date-info'>공고일자</span>2025년 3월 16일
        </li>
        <li>
          <span className='date-info'>시행일자</span>2025년 3월 16일
        </li>
      </ul>
    </div>
  );
};

export default Policy;
