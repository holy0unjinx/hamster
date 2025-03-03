import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);

// 앱이 오프라인에서 작동하고 더 빠르게 로드되도록 하려면
// unregister()를 아래에서 register()로 변경할 수 있습니다. 여기에는 몇 가지 함정이 있습니다.
// 서비스 워커에 대해 자세히 알아보세요: https://cra.link/PWA
serviceWorkerRegistration.unregister();

// 앱에서 성과 측정을 시작하려면 결과를 기록하는 함수
// 를 전달합니다(예: reportWebVitals(console.log))
// 또는 분석 엔드포인트로 전송합니다. 자세히 알아보기: https://bit.ly/CRA-vitals
reportWebVitals();
