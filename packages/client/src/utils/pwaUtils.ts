// PWA가 설치되었는지 확인하는 함수
export const isPWAInstalled = () => {
  // 스탠드얼론 모드인지 확인 (PWA로 실행 중인지)
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone ||
    document.referrer.includes('android-app://')
  );
};

// 설치 이벤트를 감지하는 함수
export const listenForInstallEvent = (callback: any) => {
  const handler = (e: any) => {
    e.preventDefault();
    callback(e);
  };

  window.addEventListener('beforeinstallprompt', handler);
  return () => window.removeEventListener('beforeinstallprompt', handler);
};
