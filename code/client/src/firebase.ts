import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  // Set your api
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestForToken = async () => {
  try {
    const currentToken = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });
    if (currentToken) {
      console.log("현재 토큰:", currentToken);
      return currentToken;
    } else {
      console.log("토큰을 가져올 수 없습니다.");
    }
  } catch (error) {
    console.log("토큰 요청 중 오류 발생:", error);
    alert("토큰 요청중 오류 발생" + error);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      // 포그라운드에서는 브라우저 알림 대신 앱 내 토스트 메시지만 표시
      console.log("포그라운드 메시지 수신:", payload);
      resolve(payload);
    });
  });
