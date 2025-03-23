import '../styles/home.scss';
import { IoSchool } from 'react-icons/io5';
import { FaBell } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';
import Badge from '@/components/Badge';
import { useState, useEffect } from 'react';
import { requestForToken, onMessageListener } from '../firebase';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
interface TimetableItem {
  classTime: number;
  subject: string;
  teacher?: string;
  hasAssessment?: boolean;
  // 기타 필요한 속성들
}

function Home() {
  const [timetable, setTimetable] = useState<any[]>([]);
  const [targetDate, setTargetDate] = useState('');
  const [assessments, setAssessments] = useState([]);
  const [todayAssessments, setTodayAssessments] = useState([]);
  const [notificationStatus, setNotificationStatus] = useState('default');
  const [notification, setNotification] = useState({ title: '', body: '' });
  const saveTokenToFirestore = (userId: any, token: any) => {
    const db = getFirestore();
    setDoc(doc(db, 'fcmTokens', userId), {
      token: token,
      createdAt: new Date().toISOString(),
    });
    return true;
  };

  useEffect(() => {
    // localStorage에서 데이터를 가져올 때 타입 지정
    const timetableString = localStorage.getItem('timetable');
    const assessmentString = localStorage.getItem('assessment');

    const currentDate = new Date(new Date());
    const kstOffset = 9 * 60 * 60 * 1000; // 9시간을 밀리초로 변환
    const kstDate = new Date(currentDate.getTime() + kstOffset);
    const currentWeekday = kstDate.getDay(); // 0(일요일)~6(토요일)

    let targetDate;
    let targetWeekday;

    // 주말인 경우 다음 주 월요일로 설정
    if (currentWeekday === 0 || currentWeekday === 6) {
      targetDate = new Date(kstDate);
      // 일요일(0)이면 1일 후, 토요일(6)이면 2일 후가 월요일
      const daysToNextMonday = currentWeekday === 0 ? 1 : 2;
      targetDate.setDate(kstDate.getDate() + daysToNextMonday);
      targetWeekday = 1; // 월요일은 1입니다 (JavaScript 표준)
    } else {
      // 평일인 경우 현재 날짜 사용
      targetDate = new Date(kstDate);
      targetWeekday = currentWeekday;
    }

    // 날짜 형식 지정 (YYYY-MM-DD)
    const formattedDate = targetDate.toISOString().split('T')[0];
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

  // Assessment 인터페이스 정의
  interface Assessment {
    id: number;
    title: string;
    description: string;
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

  function requestNotificationPermission() {
    if (!('Notification' in window)) {
      alert('이 브라우저는 알림 기능을 지원하지 않습니다.');
      return;
    }

    if (Notification.permission === 'granted') {
      // 이미 권한이 허용된 경우
      console.log('알림 권한이 이미 허용되었습니다.');
      setNotificationStatus('granted');
      return;
    }

    if (Notification.permission !== 'denied') {
      // 권한 요청
      Notification.requestPermission().then((permission) => {
        setNotificationStatus(permission);
        if (permission === 'granted') {
          console.log('알림 권한이 허용되었습니다.');
          // 여기서 알림 보내기 가능
          // new Notification("알림 테스트");
        }
      });
    }

    const setupNotifications = async () => {
      try {
        if (!('Notification' in window)) {
          console.log('이 브라우저는 알림을 지원하지 않습니다.');
          return;
        }

        let permission = Notification.permission;
        if (permission !== 'granted' && permission !== 'denied') {
          permission = await Notification.requestPermission();
        }

        if (permission === 'granted') {
          const token = await requestForToken();
          if (token) {
            console.log('FCM 토큰 설정 완료');

            const userId = localStorage.getItem('userId');
            if (!userId) {
              console.error('사용자 ID를 찾을 수 없습니다.');
              return;
            }

            const saved = await saveTokenToFirestore(userId, token);
            if (saved) {
              console.log('FCM 토큰이 Firestore에 저장되었습니다.');
            } else {
              console.error('FCM 토큰 저장에 실패했습니다.');
            }
          }
        }
      } catch (error) {
        console.error('알림 설정 중 오류 발생:', error);
      }
    };

    setupNotifications();

    const unsubscribe = onMessageListener()
      .then((payload: any) => {
        setNotification({
          title: payload.notification.title,
          body: payload.notification.body,
        });
      })
      .catch((err) => console.log('메시지 수신 실패: ', err));

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      unsubscribe;
    };
  }

  return (
    <div className='home'>
      <header>
        <Link to='mypage'>
          <IoSchool /> {localStorage.getItem('name')}님
        </Link>

        <button className='right' onClick={requestNotificationPermission}>
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
            onClick={requestNotificationPermission}
          >
            {notificationStatus === 'denied' ? '설정 변경하기' : '허용하기'}
          </button>
        </div>
      )}
      {notification.title && (
        <div className='notification-box'>
          <h3>{notification.title}</h3>
          <p>{notification.body}</p>
        </div>
      )}
      <div className='announcement'>
        <a href='https://naver.me/xq3svIzZ'>
          <img src='imgs/공지사항.png' alt='' />
        </a>
      </div>
      <div className='box'>
        <div className='title'>
          <Link to='timetable'>
            오늘의 시간표 <FaChevronRight />
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
            <div className='no_assessment'>아직 없네요...</div>
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
