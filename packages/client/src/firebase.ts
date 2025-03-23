import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: 'AIzaSyAv_JwaDYsHbpbZWRrpa_qJ_jzgetVrBsA',
  authDomain: 'hamster-cbf88.firebaseapp.com',
  projectId: 'hamster-cbf88',
  storageBucket: 'hamster-cbf88.firebasestorage.app',
  messagingSenderId: '283307970390',
  appId: '1:283307970390:web:d14002dca8350c7bc390f7',
  measurementId: 'G-97YE9FB0B4',
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestForToken = async () => {
  try {
    const currentToken = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });
    if (currentToken) {
      console.log('현재 토큰:', currentToken);
      return currentToken;
    } else {
      console.log('토큰을 가져올 수 없습니다.');
    }
  } catch (error) {
    console.log('토큰 요청 중 오류 발생:', error);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
