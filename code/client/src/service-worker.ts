/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

// 이 서비스 워커는 사용자 정의가 가능합니다!
// 사용 가능한 Workbox 모듈 목록은 https://developers.google.com/web/tools/workbox/modules
// 에서 확인하거나 원하는 다른
// 코드를 추가하세요.
// 서비스 워커를 사용하지 않으려는 경우 이 파일을 제거할 수도 있으며, Workbox 빌드 단계는 건너뜁니다.

import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

clientsClaim();

// 빌드 프로세스에서 생성된 모든 에셋을 사전 캐시합니다.
// 해당 URL은 아래 매니페스트 변수에 삽입됩니다.
// 이 변수는 서비스 워커 파일 어딘가에 있어야 하며
// 사전 캐시를 사용하지 않기로 결정하더라도 마찬가지입니다. https://cra.link/PWA 를 참조하세요.
precacheAndRoute(self.__WB_MANIFEST);

// App Shell 스타일 라우팅을 설정하여 모든 탐색 요청이
// index.html 셸로 충족되도록 합니다. 자세한 내용은
// https://developers.google.com/web/fundamentals/architecture/app-shell 에서 확인하세요.
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(
  // index.html에서 요청을 이행하지 않도록 하려면 false를 반환합니다.
  ({ request, url }: { request: Request; url: URL }) => {
    // 탐색이 아니면 건너뜁니다.
    if (request.mode !== 'navigate') {
      return false;
    }

    // /_로 시작하는 URL이면 건너뜁니다.
    if (url.pathname.startsWith('/_')) {
      return false;
    }

    // 이것이 리소스의 URL처럼 보이면
    // 파일 확장자를 포함하고 있으므로 건너뜁니다.
    if (url.pathname.match(fileExtensionRegexp)) {
      return false;
    }

    // 핸들러를 사용하고 싶다는 신호를 보내려면 true를 반환합니다.
    return true;
  },
  createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html'),
);

// precache에서 처리되지 않는 요청에 대한 예시 런타임 캐싱 경로, 이 경우 public/ 에서 온 것과 같은 동일 출처 .png 요청
registerRoute(
  // 필요에 따라 다른 파일 확장자나 라우팅 기준을 추가합니다.
  ({ url }) =>
    url.origin === self.location.origin && url.pathname.endsWith('.png'),
  // 필요에 따라 이 전략을 사용자 정의합니다(예: CacheFirst로 변경).
  new StaleWhileRevalidate({
    cacheName: 'images',
    plugins: [
      // 이 런타임 캐시가 최대 크기에 도달하면
      // 가장 최근에 사용되지 않은 이미지가 제거되도록 합니다.
      new ExpirationPlugin({ maxEntries: 50 }),
    ],
  }),
);

// 이렇게 하면 웹 앱이 다음을 통해 skipWaiting을 트리거할 수 있습니다.
// registration.waiting.postMessage({type: 'SKIP_WAITING'})
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 다른 사용자 정의 서비스 워커 로직은 여기에 들어갈 수 있습니다.

// self.addEventListener('push', function (event) {
//   const data = event.data?.json(); // 서버가 JSON을 보낸다고 가정
//   const options = {
//     body: data.body,
//     icon: 'icon.png',
//     badge: 'badge.png',
//   };

//   event.waitUntil(self.registration.showNotification(data.title, options));
// });
