import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/install.scss';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt]: any = useState();
  const [isIOS, setIsIOS] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    if (!isIOSDevice) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }

    return () => {
      if (!isIOSDevice) {
        window.removeEventListener(
          'beforeinstallprompt',
          handleBeforeInstallPrompt,
        );
      }
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`사용자의 설치 프롬프트 응답: ${outcome}`);
      setDeferredPrompt(null);

      if (outcome === 'accepted') {
        setTimeout(() => {
          navigate('/');
        }, 1000);
      }
    }
  };

  const renderInstallInstructions = () => {
    if (isIOS) {
      return (
        <>
          <p>iOS에서 앱을 설치하려면:</p>
          <ol>
            <li>Safari 브라우저의 공유 버튼을 탭하세요.</li>
            <li>'홈 화면에 추가' 옵션을 선택하세요.</li>
          </ol>
        </>
      );
    }
    return (
      <button onClick={handleInstallClick} className='install-button'>
        앱 설치하기
      </button>
    );
  };

  return (
    <div className='install-prompt-container'>
      <h2>앱 설치 안내</h2>
      <p>더 나은 사용자 경험을 위해 앱을 설치해주세요.</p>
      {renderInstallInstructions()}
    </div>
  );
};

export default InstallPrompt;
