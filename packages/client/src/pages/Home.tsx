import '../styles/home.scss';
import { IoSchool } from 'react-icons/io5';
import { FaBell } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';
import Badge from '@/components/Badge';
import { useState, useEffect } from 'react';

function Home() {
  const [timetable, setTimetable] = useState([]);
  const [targetDate, setTargetDate] = useState('');

  useEffect(() => {
    // localStorage에서 데이터를 가져올 때 타입 지정
    const timetableString = localStorage.getItem('timetable');

    if (timetableString) {
      try {
        const timetableData = JSON.parse(timetableString);

        // 현재 날짜와 요일 계산
        const currentDate = new Date();
        const currentWeekday = currentDate.getDay(); // 0: 일요일, 1: 월요일, ...

        // 요일 매핑 (일요일=0 → 월요일=0으로 변환)
        let targetWeekday;
        let newTargetDate;

        // 주말인 경우(토요일 또는 일요일) 다음 주 월요일로 설정
        if (currentWeekday === 0 || currentWeekday === 6) {
          // 다음 월요일까지 남은 일수 계산
          const daysToNextMonday = currentWeekday === 0 ? 1 : 2;
          newTargetDate = new Date(currentDate);
          newTargetDate.setDate(currentDate.getDate() + daysToNextMonday);
          targetWeekday = 0; // 월요일
        } else {
          // 평일인 경우 현재 날짜 사용
          newTargetDate = currentDate;
          // 일요일=0을 월요일=0으로 변환 (API 데이터 형식에 맞춤)
          targetWeekday = currentWeekday - 1;
        }

        // 날짜 형식 지정 (YYYY-MM-DD)
        const formattedDate = newTargetDate.toISOString().split('T')[0];
        setTargetDate(formattedDate);

        // 해당 요일의 시간표 추출
        const todayTimetable = timetableData[targetWeekday];

        // '스클3' 과목 제외한 시간표 설정
        const filteredTimetable = todayTimetable.filter(
          (entry: { classTime: number }) => entry.classTime !== 8,
        );
        setTimetable(filteredTimetable);
      } catch (error) {
        console.error('시간표 데이터 파싱 오류:', error);
      }
    }
  }, []);
  return (
    <div className='home'>
      <header>
        <Link to='mypage'>
          <IoSchool /> {localStorage.getItem('name')}님
        </Link>

        <button className='right'>
          <FaBell />
        </button>
      </header>
      <div className='announcement'>
        <a href='https://page.kakao.com/content/65171279'>
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
            {timetable.map((item: any, index) =>
              item.subject ? (
                <li key={index}>
                  {item.subject}
                  {item.teacher &&
                    item.subject !== '스클3' &&
                    item.subject !== '스클2' &&
                    item.subject !== '스클1' &&
                    item.subject !== '주제' && (
                      <Badge content={`${item.teacher}T`} />
                    )}
                </li>
              ) : (
                <li key={index} className='disabled'></li>
              ),
            )}
          </ol>
        </div>
      </div>
      <div className='box'>
        <div className='title'>
          <Link to=''>
            수행평가
            <FaChevronRight />
          </Link>
        </div>
        <div className='assessment'>
          {/* <div className='container'>
            <div className='icon'>🦅</div>
            <div className='content'>
              <div className='head'>
                일본어 <Badge content='은하제T' />
              </div>
              <div className='title'>뉴스 기사 일본어로 번역하기 (20점)</div>
            </div>
          </div>
          <div className='date'>3. 4. (목) 1교시</div> */}
          <div className='no_assessment'>아직 없네요...</div>
        </div>
      </div>
      <div className='box'>
        <div className='title'>
          <a href='https://page.kakao.com/content/65171279'>
            버그 제보
            <FaChevronRight />
          </a>
        </div>
      </div>
    </div>
  );
}

export default Home;
