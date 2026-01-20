/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  // Set your api
});

const messaging = firebase.messaging();

// TODO: 메세지 받는 로직 수정
self.addEventListener("push", (event) => {
  if (event.data) {
    const payload = event.data.json();
    if (payload.data && (payload.data.source === "firebase" || payload.from)) {
      return;
    }

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: "/icons/logo192.png",
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

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const baseUrl = self.location.origin;
  const relativePath = event.notification.data?.url || "/";
  const urlToOpen = new URL(relativePath, baseUrl).href;

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.startsWith(urlToOpen) && "focus" in client) {
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    }),
  );
});
