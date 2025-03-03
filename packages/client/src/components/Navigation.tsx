import React from 'react';
import '../styles/navigation.scss';
import { GoHomeFill } from 'react-icons/go';
import { MdViewTimeline } from 'react-icons/md';
import { FaCalendar } from 'react-icons/fa';
import { MdGrade } from 'react-icons/md';
import { IoMenu } from 'react-icons/io5';
import { Link } from 'react-router-dom';

interface NavigationProps {
  active: string;
}

function Navigation({ active }: NavigationProps) {
  return (
    <div className='navigation'>
      <ul>
        <li className={active === 'home' ? 'current' : ''}>
          <Link to=''>
            <GoHomeFill />홈
          </Link>
        </li>
        <li className={active === 'timetable' ? 'current' : ''}>
          <Link to='timetable'>
            <MdViewTimeline />
            시간표
          </Link>
        </li>
        <li className={active === 'schedule' ? 'current' : ''}>
          <Link to='schedule'>
            <FaCalendar />
            캘린더
          </Link>
        </li>
        <li className={`disabled ${active === 'grade' ? 'current' : ''}`}>
          <Link to=''>
            <MdGrade />
            성적
          </Link>
        </li>
        <li className={active === 'menu' ? 'current' : ''}>
          <Link to='menu'>
            <IoMenu />
            전체
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default Navigation;
