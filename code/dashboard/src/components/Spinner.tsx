import React from 'react';
import '../styles/spinner.scss';

interface SpinnerProps {
  isLoading: boolean;
  text?: string;
}

const Spinner: React.FC<SpinnerProps> = ({
  isLoading,
  text = '로딩 중...',
}) => {
  if (!isLoading) return null;

  return (
    <div className='spinner-overlay'>
      <div className='spinner-container'>
        <div className='spinner'></div>
        <p>{text}</p>
      </div>
    </div>
  );
};

export default Spinner;
