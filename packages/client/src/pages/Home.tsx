import React from 'react';
import '../styles/home.scss';
import { IoSchool, IoSchoolSharp } from 'react-icons/io5';
import { FaBell } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';
import Badge from '@/components/Badge';
// Home 컴포넌트 수정
import { useRef, useState, useEffect } from 'react';

function ListItem({
  children,
  badges,
}: {
  children: string;
  badges: React.ReactNode;
}) {
  const textRef = useRef<HTMLDivElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    if (textRef.current) {
      const lineHeight = parseInt(getComputedStyle(textRef.current).lineHeight);
      const isMultiLine = textRef.current.scrollHeight > lineHeight * 1.5;
      setIsTruncated(isMultiLine);
    }
  }, []);

  return (
    <li>
      <div
        ref={textRef}
        className='text-container'
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
      {!isTruncated && <div className='badge-container'>{badges}</div>}
    </li>
  );
}

function Home() {
  return (
    <div className='home'>
      <header>
        <Link to=''>
          <IoSchool /> 김솔음님
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
          <p>20■■-09-13 (1-5)</p>
          <ol>
            <li>
              수학 <Badge content='백사헌T' />
            </li>
            <li>정보통신윤리및... </li>
            <li>
              일본어 <Badge content='은하제T' />{' '}
              <Badge content='수행평가' background='0, 50, 150, 0.25' />
            </li>
            <li>
              기술 <Badge content='류재관T' />
            </li>
            <li>
              스포츠클럽 <Badge content='이자헌T' />
            </li>
            <li>
              주제선택 <Badge content='제이삼T' />{' '}
            </li>
            <li className='disabled'></li>
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
          <div className='container'>
            <div className='icon'>🦅</div>
            <div className='content'>
              <div className='head'>
                일본어 <Badge content='은하제T' />
              </div>
              <div className='title'>뉴스 기사 일본어로 번역하기 (20점)</div>
            </div>
          </div>
          <div className='date'>3. 4. (목) 1교시</div>
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
