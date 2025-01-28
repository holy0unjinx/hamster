# 1. 개요

햄스터(HAMS-TER)는 현암중학교의 공식 앱으로, 학생들의 성적 관리를 더욱 수월하게 돕는 것을 목적으로 합니다. 이 앱은 2025년 학생자치회 회장 공약의 일환으로 제작되고 있습니다.

2월 초부터 일부 선생님들을 대상으로 베타 테스트를 진행하며, 3월 새 학기와 함께 정식 출시될 예정입니다.

이 프로젝트는 전교생을 위해 개발되었으며, 사용자 친화적인 UI를 통해 교직원들도 쉽게 사용할 수 있도록 제작됩니다. 학교 공식 앱인 만큼 보안성도 철저히 관리할 예정입니다.

## 1.1 핵심 기능

- 수행평가 일정 관리
- 학사일정 관리 및 조회
- 시간표 확인 시스템
- 내신 점수 계산기 (2학기 지원 예정)
- 푸시 알림 서비스

## 1.2 목표 사용자

- 주 사용자
  - 현암중학교 재학생
- 부 사용자
  - 교사
  - 학부모

## 1.3 기대 효과

1. 학생들의 수행평가 및 학습 관리 효율화
2. 학사 정보의 통합적 관리
3. 모바일 환경에서의 접근성 향상
4. 실시간 알림을 통한 전보 전달력 강화

# 2. 기술 스택

## 2.1 프론트엔드

- React v19
- PWA (Progressive Web App)
- Material UI (MUI) [현재 검토중]
- React Router v6
- Vite

## 2.2 백엔드

- Node.js
- Express.js
- Vercel Postgres
- JWT Token (Refresh Token 및 생성용 키 검증용 키 운영)

## 2.3 인프라

- Vercel Deploy
- Workbox (for service-worker)
- Web Push API
- Git
- Yarn
- Typescript

# 3. 시스템 아키텍쳐

이 부분은 프로젝트의 시스템 구조를 다룹니다.

## 3.1 전체 시스템 구조도

```
hamster
	packages
		client
			node_modules
			public
			src
				components
					BottomNavigation.tsx
				pages
					App.tsx
					Page.tsx
				styles
					_palette.scss
					_variables.scss
					...
				App.tsx
				main.tsx
			.env
			.gitignore
			index.html
			package.json
			tsconfig.json
			vite.config.ts
			yarn.lock
		server
			src
			.gitignore
			package.json
	package.json
	README.md

```

## 3.2 데이터베이스 스키마

```sql

-- User Profiles
CREATE TABLE students (
	student_id SERIAL PRIMARY KEY,
	student_number INTEGER UNIQUE NOT NULL,
	password_hash VARCHAR(255) NOT NULL,
  grade INTEGER NOT NULL,
  class INTEGER NOT NULL,
  number INTEGER NOT NULL,
	name VARCHAR(50) NOT NULL,
	activated BOOLEAN DEFAULT FALSE
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	last_login TIMESTAMP
);

CREATE TABLE teachers (
	teachers_id SERIAL PRIMARY KEY,
	email VARCHAR(255) UNIQUE NOT NULL,
	password_hash VARCHAR(255) NOT NULL,
	name VARCHAR(50) NOT NULL,
	subject VARCHAR(50) NOT NULL,
	teachers_office VARCHAR(50),
	hoomroom_class VARCHAR(50)
);

-- CREATE TABLE parents ();

-- School Schedules
CREATE TABLE school_schedules (
	schedule_id SERIAL PRIMARY KEY,
	title VARCHAR(100) NOT NULL,
	description TEXT,
	start_date DATE NOT NULL,
	end_date DATE NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subject and Assessments for management
CREATE TABLE subjects (
	subject_id SERIAL PRIMARY KEY,
	subject_name VARCHAR(50) NOT NULL,
	grade INTEGER NOT NULL
);

CREATE TABLE performance_assessments (
	assessment_id SERIAL PRIMARY KEY,
	subject_id INTEGER REFERENCES subjects(subject_id),
	title VARCHAR(100) NOT NULL,
	description TEXT,
	max_score DECIMAL(5,2) NOT NULL
);

-- Score DATABASE
--CREATE TABLE exam_scores (
--  score_id SERIAL PRIMARY KEY,
--  student_id INTEGER REFERENCES students(student_id),
--  subject_id INTEGER REFERENCES subjects(subject_id),
--  exam_type VARCHAR(20) NOT NULL, -- 'MIDTERM', 'FINAL'
--  score DECIMAL(5,2) NOT NULL,
--  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
--);

--CREATE TABLE assessment_score (
--	score_id SERIAL PRIMARY KEY,
--	student_id INTEGER REFERENCES stdents(student_id),
--	assessment_id INTEGER REFERENCES performance_assessment(assessment_id),
--	score DECIMAL(5,2) NOT NULL,
--	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
--);

-- Notification Settings
CREATE TABLE notifications (
	notification_id SERIAL PRIMARY KEY,
	student_id INTEGER REFERENCES students(student_id),
	title VARCHAR(100) NOT NULL,
	content TEXT NOT NULL,
	id_read BOOLEAN DEFAULT FALSE,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

-- Push Subscriptions information
CREATE TABLE push_subscriptions (
	subscription_id SERIAL PRIMARY KEY,
	student_id INTEGER REFERENCES students(student_id),
	endpoint TEXT NOT NULL,
	p256dh TEXT NOT NULL,
	auth TEXT NOT NULL,
	created_at TIMESTAMP DEFUALT CURRENT_TIMESTAMP
);

-- Indexes for frequently accessed Columns
CREATE INDEX idx_student_profiles_grade_class ON students(grade, class);
CREATE INDEX idx_notifications_user_id ON notifications(student_id);
CREATE INDEX idx_exam_scores_student_id ON exam_scores(student_id);
```

## 3.3 API 설계

1. 인증 관련 API
   - 학생 인증
     ```
     POST /api/auth/student/login
     - 학생 로그인
     - Request: { studentNumber, password }
     - Response: { token, student }

     POST /api/auth/student/register
     - 학생 회원가입
     - Request: { studentNumber, password, name, grade, class, number }
     - Response: { message, student }

     PUT /api/auth/student/activate
     - 학생 계정 활성화
     - Request: { studentNumber, activationCode }
     - Response: { message, activated }
     ```
   - 교사 인증
     ```
     POST /api/auth/teacher/login
     - 교사 로그인
     - Request: { email, password }
     - Response: { token, teacher }

     POST /api/auth/teacher/register
     - 교사 회원가입
     - Request: { email, password, name, subject, teachersOffice, homeroomClass }
     - Response: { message, teacher }
     ```
   - 공통 인증
     ```
     POST /api/auth/refresh
     - 토큰 갱신
     - Request: { refreshToken }
     - Response: { newToken }

     POST /api/auth/logout
     - 로그아웃
     - Request: Header(Authorization)
     - Response: { message }
     ```
2. 사용자 관련 API
   - 학생 API
     ```
     GET /api/students/me
     - 현재 학생 정보 조회
     - Response: { student }

     PUT /api/students/me
     - 학생 정보 수정
     - Request: { password, name }
     - Response: { student }

     GET /api/students
     - 학생 목록 조회 (교사용)
     - Query: { grade, class }
     - Response: { students: [] }
     ```
   - 교사 API
     ```
     GET /api/teachers/me
     - 현재 교사 정보 조회
     - Response: { teacher }

     PUT /api/teachers/me
     - 교사 정보 수정
     - Request: { password, name, subject, teachersOffice, homeroomClass }
     - Response: { teacher }
     ```
3. 학사일정 API
   - 학사일정
     ```
     GET /api/schedules
     - 학사일정 목록 조회
     - Query: { startDate, endDate }
     - Response: { schedules: [] }

     POST /api/schedules
     - 학사일정 등록 (교사 전용)
     - Request: { title, description, startDate, endDate }
     - Response: { schedule }

     PUT /api/schedules/{scheduleId}
     - 학사일정 수정 (교사 전용)
     - Request: { title, description, startDate, endDate }
     - Response: { schedule }
     ```
4. 과목 및 평가 관련 API
   - 과목 및 평가
     ```
     GET /api/subjects
     - 과목 목록 조회
     - Query: { grade }
     - Response: { subjects: [] }

     POST /api/subjects
     - 과목 등록 (교사 전용)
     - Request: { subjectName, grade }
     - Response: { subject }

     GET /api/assessments
     - 수행평가 목록 조회
     - Query: { subjectId }
     - Response: { assessments: [] }

     POST /api/assessments
     - 수행평가 등록 (교사 전용)
     - Request: { subjectId, title, description, maxScore }
     - Response: { assessment }
     ```
5. 성적 관련 API (2학기 지원 예정)
   - 시험 성적
     ```
     GET /api/scores/exams
     - 시험 성적 조회
     - Query: { studentId?, subjectId, examType }
     - Response: { examScores: [] }

     POST /api/scores/exams
     - 시험 성적 등록 (교사 전용)
     - Request: { studentId, subjectId, examType, score }
     - Response: { examScore }
     ```
   - 수행평가
     ```
     GET /api/scores/assessments
     - 수행평가 성적 조회
     - Query: { studentId?, assessmentId }
     - Response: { assessmentScores: [] }

     POST /api/scores/assessments
     - 수행평가 성적 등록 (교사 전용)
     - Request: { studentId, assessmentId, score }
     - Response: { assessmentScore }
     ```
6. 알림 관련 API
   - 알림
     ```
     GET /api/notifications
     - 알림 목록 조회
     - Query: { page, limit }
     - Response: { notifications: [], total }

     POST /api/notifications/subscribe
     - 푸시 알림 구독
     - Request: { endpoint, p256dh, auth }
     - Response: { message }

     PUT /api/notifications/{notificationId}/read
     - 알림 읽음 처리
     - Response: { notification }
     ```
7. 공통 응답 형식
   - 응답 형식
     ```
     // 성공 응답
     {
         "success": true,
         "data": {}, // 실제 데이터
         "message": "성공 메시지"
     }

     // 에러 응답
     {
         "success": false,
         "error": {
             "code": "ERROR_CODE",
             "message": "에러 메시지"
         }
     }
     ```

## 3.4 보안 구조

- 데이터 암호화
  - AES-256 기반의 암호화 시스템 적용
  - 데이터 전송 및 저장 시 암호화 처리
  - 개인정보 및 성적 데이터 특별 보호
- 사용자 인증
  - JWT(JSON Web Token) 기반 인증 시스템
  - 역할 기반 접근 제어(RBAC)
    - 학생용 접근 권한
    - 교사용 접근 권한
    - 관리자용 접근 권한
  - 로그인 시도 제한으로 무차별 대입 공격 방지
- 웹 보안
  - HTTPS 프로토콜 적용
  - CORS(Cross-Origin Resource Sharing) 정책 설정
  - XSS(Cross-Site Scripting) 방어
  - CSRF(Cross-Site Request Forgery) 방어
  - SQL Injection 방지
- PWA 보안 기능
  - 서비스 워커 보안 설정
  - HTTPS 환경에서만 동작
  - 캐시 데이터 암호화
  - 오프라인 데이터 보안 관리
- 모니터링 및 로깅
  - 사용자 활동 로그 기록
  - 보안 위협 실시간 모니터링
  - 비정상 접근 탐지 및 차단
  - 로그 데이터 암호화 저장
- 개인정보 보호
  - 최소한의 필수 정보만 수집
  - 개인정보 처리방침 규정 및 준수
  - 데이터 보관 기한 설정
  - 사용자 동의 기반 정보 수집

# 4. UI / UX 설계

## 4.1 디자인 시스템

색깔:

-

## 4.2 프로토타입

https://www.figma.com/design/LIL3W0qrWwAte4pnJUWYzM/HAMS%ED%84%B0?node-id=0-1&t=UmO9bL5Y1W8Qpkme-1

# 5. 품질 관리

## 5.1 성능 최적화

- UI 최적화
  - 메인 스레드에서 무거운 작업 제거
  - 뷰 계층 구조 최소화
  - 이미지 리사이징 및 리소스 압축
  - 부드러운 애니메이션 구현
- 메모리 관리
  - 효율적인 캐싱 전략 구형
- 데이터베이스 최적화
  - 백그라운드 스레드에서 데이터베이스 작업 수행
  - 쿼리 성능 개선을 위한 인덱싱
  - 쿼리 결과 캐싱 구현
- PWA 최적화
  - 웹 앱 크기 최소화
    - 미사용 코드 및 리소스 제거
    - 이미지 및 어셋 압축
    - 백터 그래픽 활용
  - 네트워크 최적화
    - 네트워크 호출 및 최소화
    - 서버 응답 캐싱
    - 데이터 압축 전송
  - 성능 모니터링
    - CPU, 메모리, 네트워크 사용량 모니터링
    - 성능 지표 수집 및 분석과 문서화
    - CPU, 메모리 제한 및 네트워크 대역폭 제한 테스트 (LTE)
  - 배터리 최적화
    - 백그라운드 작업 효율적 관리

## 5.2 보안 점검

- 인증 및 권한 검증
  - 비밀번호 마스킹 처리 확인
  - 로그인 시도 5회 제한 검증
  - 세션 관리 및 권한 검사
- 데이터 보안
  - 중요 정보 암호화 저장 확인
  - 캐시 데이터 보안 검증
  - 개인정보 처리 정책 준수 확인
- 보안 모니터링
  - 실시간 보안 위협 모니터링
  - 로그 분석 및 이상 징후 탐지
  - 보안 이벤트 대응 체계 구축
- 정기적 보안 점검
  - 월간 보안 취약점 진단 실시
  - ~~분기별 모의해킹 테스트~~
  - 보안 패치 및 업데이트 관리

## 5.3 접근성 검증

**자동화 검사**

- Lighthouse 검사
  - PWA 접근성 기준 충족도 검증
  - 성능 및 최적화 상태 확인
  - HTTPS 보안 연결 검증
  - 웹 접근성 가이드라인 준수 여부 확인
- 크로스 브라우저 테스트
  - 다양한 브라우저 호환성 검증
  - 반응형 디자인 적용 확인
  - 터치 인터랙션 동작 검증

**수동 접근성 검사**

- 화면 읽기 검증
  - 스크린 리더 호환성 테스트
  - 대체 텍스트 제공 여부 확인
  - 콘텐츠 구조의 논리성 검증
- 키보드 접근성
  - 모든 기능의 키보드 접근 사능성
  - 탭 순서의 논리성
  - 포커스 표시 명확성
- 시각적 접근성
  - 텍스트 크기 조절 가능
  - 색상 대비율 준수
  - 고대비 모드 지원
  - 글꼴 가독성 검증
- 기술적 접근성
  - 오프라인 기능 검증
  - 설치 가능성 테스트
  - 푸시 알림 접근성
  - 캐시 전략 검증

## 5.4 베타 테스트

**준비 단계**

- 알파 테스트 완료
- 베타 테스트 목표 및 범위 문서화
- 테스트 기간 설정 (2025년 2월 초)
- 베타 테스터 선정
  - 현암중학교 교직원 일부
  - 다양한 디바이스 사용자 포함

**테스트 항목**

1. 신뢰성
   1. 장시간 사용 시 안정성 확인
   2. 시각적 요소 렌더링 정확성 검증
   3. 데이터 저장 및 동기화 안정성 확인
2. 접근성
   1. PWA 설치 용이성 확인
   2. 터치 타겟 크기 적절성 확인
   3. 반응형 디자인 적용 확인
   4. 다양한 브라우저 및 기기 호환성 검증
3. 기능성
   1. 모든 핵심 기능의 정상 작동 여부
   2. 사용자 인터페이스의 직관성 검증
   3. 데이터 입출력 정확성 확인
4. 보안성
   1. 사용자 인증 시스템 검증
   2. 개인정보 보호 기능 점검
   3. 데이터베이스 암호화 확인

- 피드백 수집 및 관리
  - 버그 리포트 수집 체계 구축
  - 사용자 피드백 분류 시스템 준비
  - 개선 요청사항 기록 및 추적
- 후속 조치
  - 발견된 버그 수정 계획 수립
  - 중요 피드백 반영 우선순위 설정
  - 필요시 재테스트 계획 수립
