import React, { useEffect } from 'react';
import '../styles/spinner.scss';

interface SpinnerProps {
  isLoading: boolean;
}

const Spinner = ({ isLoading }: SpinnerProps) => {
  // 스피너가 활성화되면 body에 클래스 추가하여 스크롤 방지
  useEffect(() => {
    if (isLoading) {
      document.body.classList.add('spinner-active');
    } else {
      document.body.classList.remove('spinner-active');
    }

    // 컴포넌트 언마운트 시 클래스 제거
    return () => {
      document.body.classList.remove('spinner-active');
    };
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className='spinner-overlay'>
      <div className='spinner-container'>
        <div className='spinner'></div>
      </div>
    </div>
  );
};

export default Spinner;
