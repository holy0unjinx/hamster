import { useState, useEffect } from 'react';
import { isPWAInstalled } from '../utils/pwaUtils';
import Spinner from './Spinner';

const PWAInstallationCheck = ({ children }: any) => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // PWA 설치 상태 확인
    const checkInstallation = () => {
      setIsInstalled(isPWAInstalled());
      setIsChecking(false);
    };

    checkInstallation();

    // 디스플레이 모드 변경 감지 (설치 후 변경될 수 있음)
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const listener = (e: any) => {
      if (e.matches) {
        setIsInstalled(true);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', listener);
    } else {
      // 이전 버전 브라우저 지원
      mediaQuery.addListener(listener);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', listener);
      } else {
        mediaQuery.removeListener(listener);
      }
    };
  }, []);

  if (isChecking) {
    return <Spinner isLoading={isChecking} text={'확인중...'} />;
  }

  return children(isInstalled);
};

export default PWAInstallationCheck;
