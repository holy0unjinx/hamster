/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
importScripts(
  'https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js',
);
importScripts(
  'https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js',
);

firebase.initializeApp({
  apiKey: 'AIzaSyAv_JwaDYsHbpbZWRrpa_qJ_jzgetVrBsA',
  authDomain: 'hamster-cbf88.firebaseapp.com',
  projectId: 'hamster-cbf88',
  storageBucket: 'hamster-cbf88.firebasestorage.app',
  messagingSenderId: '283307970390',
  appId: '1:283307970390:web:d14002dca8350c7bc390f7',
  measurementId: 'G-97YE9FB0B4',
});

const messaging = firebase.messaging();

self.addEventListener('push', (event) => {
  if (event.data) {
    const payload = event.data.json();
    if (payload.data && payload.data.source === 'firebase') return;

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: '/logo192.png',
      data: payload.data,
    };

    event.waitUntil(
      self.registration.showNotification(
        notificationTitle,
        notificationOptions,
      ),
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        let client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    }),
  );
});
