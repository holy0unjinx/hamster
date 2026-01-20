# 주의 사항

```
// 내가 이 코드를 작성했을 때는 신과 나만이 그 내용을 이해했다.
// 하지만 이제는, 오직 신만이 아신다!
//
// 그러니 이 코드를 건드리려다 실패하면(당연히 실패할 겁니다),
// 다음 희생자를 위해 위 숫자를 1 올려주시길...
//
// 최적화 시도하다가 삽질한 시간: 25시간
```

이 코드는 **private**을 상정하고 제작한 코드입니다. API Key등 중요 정보를 제거하였으니, 만약에 사용하신다면, 아래의 해당 파일을 수정해주시기 바랍니다.

- `client/public/firebase-messaging-sw.js`
- `client/src/firebase.ts`

또한, 본래 계정을 데이터베이스에 저장하는 Auth 기능을 통해서 로그인을 하도록 제작하려 하였으나, 기술 상의 이유로 구현하지 않았습니다. (그 전에 구현하던 흔적이 남아있을 수도 있음)

## 각 코드에서 필요한 `.env` 파일

### Client

```
VITE_FIREBASE_VAPID_KEY=
VITE_NICE_API=
```

### Server

```
// 뭐 다른 데이터베이스 뭐시기

ACCESS_SECRET=
REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=
JWT_REFRESH_EXPIRES_IN=
ALGORITHM=
ACTIVATION_CODE=
NODE_ENV=
PORT=
DATABASE_URL=
```
