import '../styles/home.scss';
import { IoSchool } from 'react-icons/io5';
import { FaBell } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';
import Badge from '@/components/Badge';
import { useState, useEffect } from 'react';
import { requestForToken, onMessageListener } from '../firebase';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

function Home() {
  const [timetable, setTimetable] = useState<any[]>([]);
  const [targetDate, setTargetDate] = useState('');
  const [assessments, setAssessments] = useState([]);
  const [todayAssessments, setTodayAssessments] = useState([]);
  const [notificationStatus, setNotificationStatus] = useState('default');
  const [notification, setNotification] = useState({ title: '', body: '' });
  const [todayMeal, setTodayMeal] = useState<{
    menu: string;
    mealType: string;
  } | null>(null);

  // TODO: firestore 등록 자체가 안되는듯
  const saveTokenToFirestore = async (
    userId: any,
    token: any,
    classId: string,
  ) => {
    try {
      const db = getFirestore();
      const tokenRef = doc(db, 'fcmTokens', userId);
      const tokenDoc = await getDoc(tokenRef);

      if (tokenDoc.exists() && tokenDoc.data().token === token) {
        console.log('이미 등록된 토큰입니다.');
        return true;
      }

      await setDoc(tokenRef, {
        token: token,
        classId: classId, // 반 정보 추가
        createdAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error('토큰 저장 중 오류:', error);
      alert('저장 실패!' + error);
      return false;
    }
  };

  useEffect(() => {
    // localStorage에서 데이터를 가져올 때 타입 지정
    const timetableString = localStorage.getItem('timetable');
    const assessmentString = localStorage.getItem('assessment');

    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const kstDate = new Date(utc + 9 * 3600000);

    let targetDate = new Date(kstDate);
    let targetWeekday: number;

    // 12시 이후면 다음 날로 이동
    if (kstDate.getHours() >= 12) {
      targetDate.setDate(targetDate.getDate() + 1);
    }

    // 주말 처리 로직
    const currentWeekday = targetDate.getDay();
    if (currentWeekday === 0 || currentWeekday === 6) {
      const daysToAdd = currentWeekday === 0 ? 1 : 2;
      targetDate.setDate(targetDate.getDate() + daysToAdd);
      targetWeekday = 1; // 월요일 고정
    } else {
      targetWeekday = currentWeekday; // 기존 평일 유지
    }

    // 날짜 포맷팅
    const formattedDate = `${targetDate.getFullYear()}-${(
      targetDate.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${targetDate.getDate().toString().padStart(2, '0')}`;

    setTargetDate(formattedDate);

    // 시간표 처리
    if (timetableString) {
      try {
        const timetableData = JSON.parse(timetableString);

        // 해당 요일의 시간표 추출
        const todayTimetable = timetableData[targetWeekday - 1];

        // '스클3' 과목 제외한 시간표 설정
        const filteredTimetable = todayTimetable.filter(
          (entry: { classTime: number }) => entry.classTime !== 8,
        );

        if (assessmentString) {
          try {
            const assessmentData = JSON.parse(assessmentString);
            setAssessments(assessmentData);

            // 해당 날짜의 수행평가 필터링
            const dateAssessments = assessmentData.filter((assessment: any) => {
              const assessmentDate = new Date(assessment.examDate);
              return (
                assessmentDate.toISOString().split('T')[0] === formattedDate
              );
            });

            setTodayAssessments(dateAssessments);

            // 수행평가가 있는 교시의 시간표 정보를 수행평가 정보로 대체
            const updatedTimetable = [...filteredTimetable];

            dateAssessments.forEach((assessment: any) => {
              const periodIndex = updatedTimetable.findIndex(
                (item: any) => item.classTime === assessment.period,
              );

              if (periodIndex !== -1) {
                // 해당 교시의 시간표 정보를 수행평가 정보로 대체
                updatedTimetable[periodIndex] = {
                  ...updatedTimetable[periodIndex],
                  subject: assessment.subjectName, // 과목명을 수행평가 과목으로 변경
                  teacher: assessment.teacherName, // 선생님 이름을 수행평가 담당 선생님으로 변경
                  hasAssessment: true, // 수행평가 표시를 위한 플래그
                  assessmentTitle: assessment.title, // 수행평가 제목 저장
                };
              }
            });

            setTimetable(updatedTimetable);
          } catch (error) {
            console.error('수행평가 데이터 파싱 오류:', error);
            setTimetable(filteredTimetable); // 오류 시 원래 시간표 사용
          }
        } else {
          setTimetable(filteredTimetable); // 수행평가 데이터 없을 경우 원래 시간표 사용
        }
      } catch (error) {
        console.error('시간표 데이터 파싱 오류:', error);
      }
    }
    if ('Notification' in window) {
      setNotificationStatus(Notification.permission);
    }
  }, []);

  useEffect(() => {
    const fetchTodayMeal = async () => {
      try {
        // 1. localStorage에서 기존 데이터 확인
        const storedMeal = localStorage.getItem('mealData');
        const storedData = storedMeal ? JSON.parse(storedMeal) : null;

        // 2. 저장된 데이터가 있고 날짜가 일치하면 즉시 사용
        if (storedData?.date === targetDate) {
          setTodayMeal(storedData.meal);
          return;
        }

        // 3. API 호출 (신규 데이터 요청)
        const [year, month, day] = targetDate.split('-');
        const response = await fetch(
          `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${
            import.meta.env.VITE_NICE_API
          }&Type=json&ATPT_OFCDC_SC_CODE=J10&SD_SCHUL_CODE=7751015&MLSV_YMD=${year}${month}${day}`,
        );

        // 4. 데이터 처리 및 저장
        const data = await response.json();
        if (data.mealServiceDietInfo) {
          const mealData = data.mealServiceDietInfo[1].row[0];
          const newMeal = {
            menu: mealData.DDISH_NM.replace(/<br\/?>/g, '\n')
              .replace(/ㆍ/g, '\n')
              .replace(/\([^)]*\)/g, '')
              .trim(),
            mealType: mealData.MMEAL_SC_NM,
          };

          // 5. 새로운 데이터 저장
          setTodayMeal(newMeal);
          localStorage.setItem(
            'mealData',
            JSON.stringify({
              date: targetDate,
              meal: newMeal,
            }),
          );
        }
      } catch (error) {
        console.error('급식 정보 조회 실패:', error);
      }
    };

    fetchTodayMeal();
  }, [targetDate]); // targetDate 변경 시 재조회

  // Assessment 인터페이스 정의
  interface Assessment {
    id: number;
    title: string;
    maxScore: number;
    period: number;
    examDate: string;
    teacherName: string;
    subjectName: string;
  }

  const findNearestAssessment = () => {
    if (!assessments || assessments.length === 0) return null;

    const now = new Date();

    // 현재 날짜 이후의 수행평가만 필터링
    const upcomingAssessments = assessments.filter((assessment: any) => {
      const assessmentDate = new Date(assessment.examDate);
      return assessmentDate >= now;
    });

    if (upcomingAssessments.length === 0) return null;

    // 첫 번째 요소를 초기값으로 사용하는 대신, 배열 전체를 순회하면서 가장 가까운 것 찾기
    return upcomingAssessments.reduce<Assessment>(
      (nearest, assessment: any) => {
        const nearestDate = new Date(nearest.examDate);
        const assessmentDate = new Date(assessment.examDate);
        return Math.abs(assessmentDate.getTime() - now.getTime()) <
          Math.abs(nearestDate.getTime() - now.getTime())
          ? assessment
          : nearest;
      },
      upcomingAssessments[0],
    ); // 초기값으로 첫 번째 요소 제공
  };

  // 날짜 포맷팅 함수 추가
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // 요일 구하기
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];

    return `${month}. ${day}. (${weekday})`;
  };

  const RandomEmoji = () => {
    const getRandomEmoji = () => {
      // 대부분의 기기에서 지원하는 기본 이모지 목록
      const commonEmojis = [
        '😀',
        '😁',
        '😂',
        '🤣',
        '😃',
        '😄',
        '😅',
        '😆',
        '😉',
        '😊',
        '😋',
        '😎',
        '😍',
        '😘',
        '🥰',
        '😗',
        '😙',
        '😚',
        '🙂',
        '🤗',
        '🤔',
        '🤨',
        '😐',
        '😑',
        '😶',
        '🙄',
        '😏',
        '😣',
        '😥',
        '😮',
        '🤐',
        '😯',
        '😪',
        '😫',
        '🥱',
        '😴',
        '😌',
        '😛',
        '😜',
        '😝',
        '🤤',
        '😒',
        '😓',
        '😔',
        '😕',
        '🙃',
        '🤑',
        '😲',
        '☹️',
        '🙁',
        '😖',
        '😞',
        '😟',
        '😤',
        '😢',
        '😭',
        '😦',
        '😧',
        '😨',
        '😩',
        '🤯',
        '😬',
        '😰',
        '😱',
        '🥵',
        '🥶',
        '😳',
        '🤪',
        '😵',
        '🥴',
        '😠',
        '😡',
        '🤬',
        '😷',
        '🤒',
        '🤕',
        '🤢',
        '🤮',
        '🤧',
        '😇',
        '🥳',
        '🥺',
        '🤠',
        '🤡',
        '🤥',
        '🤫',
        '🤭',
        '🧐',
        '🤓',
        '😈',
        '👿',
        '👹',
        '👺',
        '💀',
        '👻',
        '👽',
        '🤖',
        '💩',
        '😺',
        '😸',
        '😹',
        '😻',
        '😼',
        '😽',
        '🙀',
        '😿',
        '😾',
        '❤️',
        '🧡',
        '💛',
        '💚',
        '💙',
        '💜',
        '🖤',
        '🤎',
        '🤍',
        '💔',
        '❣️',
        '💕',
        '💞',
        '💓',
        '💗',
        '💖',
        '💘',
        '💝',
        '💟',
        '🌟',
        '⭐',
        '✨',
        '💫',
      ];

      const randomIndex = Math.floor(Math.random() * commonEmojis.length);
      return commonEmojis[randomIndex];
    };

    return <div className='icon'>{getRandomEmoji()}</div>;
  };

  const requestNotificationPermission = async () => {
    try {
      // iOS Safari 호환성을 위한 브라우저 감지
      const isIOSSafari =
        /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        window.navigator.standalone;

      if (!('Notification' in window)) {
        throw new Error('이 브라우저는 알림을 지원하지 않습니다.');
      }

      // iOS에서는 권한 상태 체크 전에 짧은 지연 추가
      if (isIOSSafari) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      let permission = Notification.permission;

      // iOS Safari에서는 'default' 상태에서도 재요청 시도
      if (permission !== 'granted') {
        // iOS 호환성을 위한 콜백/Promise 이중 처리
        if (typeof Notification.requestPermission === 'function') {
          if (Notification.requestPermission.length === 0) {
            // Promise 버전
            permission = await Notification.requestPermission();
          } else {
            // 콜백 버전 (iOS Safari 호환)
            permission = await new Promise((resolve) => {
              Notification.requestPermission(resolve);
            });
          }
        }
      }

      return permission;
    } catch (error) {
      console.error('권한 요청 중 오류:', error);
      return 'denied';
    }
  };

  const setupNotifications = async () => {
    try {
      // 사용자 제스처 컨텍스트 확인
      if (!document.hasFocus()) {
        console.warn('사용자 제스처 컨텍스트가 필요합니다.');
        return false;
      }

      const permission = await requestNotificationPermission();

      if (permission === 'granted') {
        setNotificationStatus('granted');

        // iOS에서 토큰 발급 전 추가 지연
        const isIOSSafari =
          /iPad|iPhone|iPod/.test(navigator.userAgent) &&
          window.navigator.standalone;

        if (isIOSSafari) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }

        const token = await requestForToken();

        if (token) {
          console.log('FCM 토큰 설정 완료');
          const studentNumber = String(localStorage.getItem('studentNumber'));
          const classNumber = studentNumber.slice(0, 3);

          const saved = await saveTokenToFirestore(
            studentNumber,
            token,
            classNumber,
          );
          return saved;
        }
      } else {
        console.log('알림 권한이 거부되었습니다:', permission);
        return false;
      }
    } catch (error) {
      console.error('알림 설정 중 오류 발생:', error);
      return false;
    }
  };

  // 버튼 클릭 핸들러 개선
  const handleNotificationRequest = async (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    const button = event.currentTarget; // 항상 HTMLButtonElement 타입
    button.disabled = true;

    try {
      const success = await setupNotifications();
      if (success) {
        setNotificationStatus('granted');
      }
    } finally {
      button.disabled = false;
    }
  };

  const calculateDday = (examDate: string) => {
    const now = new Date();
    const targetDate = new Date(examDate);

    // 시간 차이 계산 (KST 기준)
    const utcNow = now.getTime() + now.getTimezoneOffset() * 60000;
    const kstNow = new Date(utcNow + 9 * 3600000);

    targetDate.setHours(0, 0, 0, 0);
    kstNow.setHours(0, 0, 0, 0);

    const diff = targetDate.getTime() - kstNow.getTime();
    const dayCount = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (dayCount === 0) return 'D-Day';
    if (dayCount > 0) return `D-${dayCount}`;
    return `D+${Math.abs(dayCount)}`;
  };

  // 최근 일정 찾기 함수 추가
  const findNearestEvent = () => {
    const calendarData = localStorage.getItem('calendar');
    if (!calendarData) return null;

    try {
      const events = JSON.parse(calendarData);
      const now = new Date();

      // 토요휴업일 제외 및 미래 일정 필터링
      const upcomingEvents = events.filter((event: any) => {
        const eventDate = new Date(
          `${event.AA_YMD.slice(0, 4)}-${event.AA_YMD.slice(
            4,
            6,
          )}-${event.AA_YMD.slice(6, 8)}`,
        );
        return event.SBTR_DD_SC_NM !== '휴업일' && eventDate > now;
      });

      if (upcomingEvents.length === 0) return null;

      // 가장 가까운 일정 찾기
      return upcomingEvents.reduce((nearest: any, event: any) => {
        const nearestDate = new Date(
          `${nearest.AA_YMD.slice(0, 4)}-${nearest.AA_YMD.slice(
            4,
            6,
          )}-${nearest.AA_YMD.slice(6, 8)}`,
        );
        const currentDate = new Date(
          `${event.AA_YMD.slice(0, 4)}-${event.AA_YMD.slice(
            4,
            6,
          )}-${event.AA_YMD.slice(6, 8)}`,
        );
        return currentDate < nearestDate ? event : nearest;
      });
    } catch (error) {
      console.error('일정 파싱 오류:', error);
      return null;
    }
  };

  useEffect(() => {
    // 컴포넌트 첫 로딩 시 알림 권한 설정 자동 시도
    setupNotifications();
  }, []);

  return (
    <div className='home'>
      <header>
        <Link to='mypage'>
          <IoSchool /> {localStorage.getItem('name')}님
        </Link>

        <button className='right' onClick={handleNotificationRequest}>
          <FaBell />
        </button>
      </header>
      {notificationStatus !== 'granted' && (
        <div className='notification-box'>
          <div className='notification-content'>
            <FaBell className='bell-icon' />
            <div className='notification-text'>
              <p className='notification-title'>알림 허용하기</p>
              <p className='notification-desc'>
                수행평가 및 시간표 변경 알림을 받아보세요!
              </p>
            </div>
          </div>
          <button
            className='notification-btn'
            onClick={handleNotificationRequest}
          >
            {notificationStatus === 'denied' ? '설정 변경하기' : '허용하기'}
          </button>
        </div>
      )}
      {/* 새로운 이벤트 박스 추가 */}
      {findNearestEvent() && (
        <div className='event-box'>
          <div className='event-name'>
            {findNearestEvent().EVENT_NM.replace(/\(.*\)/, '')}
          </div>
          <div className='event-dday'>
            {calculateDday(
              `${findNearestEvent().AA_YMD.slice(
                0,
                4,
              )}-${findNearestEvent().AA_YMD.slice(
                4,
                6,
              )}-${findNearestEvent().AA_YMD.slice(6, 8)}`,
            )}
          </div>
        </div>
      )}
      {notification.title && (
        <div className='notification-box'>
          <h3>{notification.title}</h3>
          <p>{notification.body}</p>
        </div>
      )}
      {/* <div className='announcement'>
        <a href='https://naver.me/xxY5pnEw'>
          <img src='imgs/공지사항.png' alt='' />
        </a>
      </div> */}

      <div className='box'>
        <div className='title'>
          <Link to='timetable'>
            시간표 <FaChevronRight />
          </Link>
        </div>
        <div className='timetable'>
          <p>
            {targetDate} ({localStorage.getItem('grade')}-
            {localStorage.getItem('class')})
          </p>
          <ol>
            {timetable.map((item: any, index) => {
              // 해당 교시에 수행평가가 있는지 확인
              const assessment: any = todayAssessments.find(
                (assessment: any) => assessment.period === item.classTime,
              );
              const hasAssessment = !!assessment;

              return item.subject ? (
                <li key={index}>
                  {hasAssessment ? (
                    <Link
                      className='assessment-timetable'
                      to={`/assessment/${assessment.id}`}
                    >
                      <span className='bold'>{item.subject}</span>
                      {item.teacher &&
                        item.subject !== '스클3' &&
                        item.subject !== '스클2' &&
                        item.subject !== '스클1' &&
                        item.subject !== '주제' && (
                          <Badge content={`${item.teacher}T`} />
                        )}
                      {hasAssessment && (
                        <Badge
                          content='수행평가'
                          background='0, 100, 250, 0.25'
                        />
                      )}
                    </Link>
                  ) : (
                    <>
                      <span>{item.subject}</span>
                      {item.teacher &&
                        item.subject !== '스클3' &&
                        item.subject !== '스클2' &&
                        item.subject !== '스클1' &&
                        item.subject !== '주제' && (
                          <Badge content={`${item.teacher}T`} />
                        )}
                    </>
                  )}
                </li>
              ) : (
                <li key={index} className='disabled'></li>
              );
            })}
          </ol>
        </div>
      </div>
      <div className='box'>
        <div className='title'>
          <Link to={`/assessment/${findNearestAssessment()?.id}`}>
            수행평가
            <FaChevronRight />
          </Link>
        </div>
        <div className='assessment'>
          {findNearestAssessment() ? (
            <>
              <Link to={`/assessment/${findNearestAssessment()?.id}`}>
                <div className='container'>
                  {RandomEmoji()}
                  <div className='content'>
                    <div className='head'>
                      {findNearestAssessment()?.subjectName}{' '}
                      <Badge
                        content={`${findNearestAssessment()?.teacherName}T`}
                      />
                    </div>
                    <div className='title'>
                      {findNearestAssessment()?.title} (
                      {findNearestAssessment()?.maxScore}점)
                    </div>
                  </div>
                </div>
                <div className='date'>
                  {formatDate(findNearestAssessment()?.examDate ?? '')}{' '}
                  {findNearestAssessment()?.period}교시
                </div>
              </Link>
            </>
          ) : (
            <div className='no-assessment'>
              📌 아직 등록된 수행평가가 없습니다
            </div>
          )}
        </div>
      </div>
      <div className='box'>
        <div className='title'>
          <Link to=''>
            급식 <FaChevronRight />
          </Link>
        </div>
        <div className='meal'>
          {todayMeal ? (
            <>
              <div className='meal-type'>
                {targetDate} ({todayMeal.mealType})
              </div>
              <div className='meal-list'>
                {todayMeal.menu.split('\n').map((dish, index) => (
                  <div key={index} className='meal-item'>
                    {dish.trim()}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className='no-meal'>급식 정보가 없습니다</div>
          )}
        </div>
      </div>
      <div className='box'>
        <div className='title'>
          <a href='https://naver.me/xxY5pnEw'>
            버그 제보
            <FaChevronRight />
          </a>
        </div>
      </div>
    </div>
  );
}

export default Home;
