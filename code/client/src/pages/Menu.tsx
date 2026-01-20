import { Link } from 'react-router-dom';
import '../styles/menu.scss';

function Menu() {
  return (
    <div className='menu-page'>
      <div className='title'>전체</div>
      <ul className='menu'>
        <li>
          <div className='icon'>🌞</div>
          <Link to='/mypage'>내 정보</Link>
        </li>
        <li>
          <div className='icon'>📜</div>
          <Link to='/policy'>정책</Link>
        </li>
      </ul>
      <div className='category'>기능</div>
      <ul className='menu'>
        <li>
          <div className='icon'>📆</div>
          <Link to='/schedule'>학사일정</Link>
        </li>
        <li>
          <div className='icon'>🕒</div>
          <Link to='/timetable'>시간표</Link>
        </li>
      </ul>
    </div>
  );
}

export default Menu;
