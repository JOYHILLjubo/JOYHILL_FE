# JOYHILL_FE

기쁨의동산교회 청년부 앱의 프론트엔드. React + Vite PWA. 실사용자 약 200명이 쓰는 라이브 서비스(`https://joyhill.kro.kr`) — **`main`에 push하면 GitHub Actions가 즉시 빌드해서 EC2의 nginx(`/var/www/joy-frontend`)로 배포한다.**

## 스택 / 구조

- React + React Router + Tailwind CSS + `vite-plugin-pwa`
- 모바일 전용 레이아웃: `.mobile-container`(`index.css`)로 뷰포트 최대 430px 고정
- `src/pages/*Connected.jsx` = API 연동된 실제 화면, `src/pages/*Page.jsx`(Connected 없는 것) = 일부는 정적 목업이 남아있을 수 있음 — 새로 작업할 화면이 실제로 쓰이는지 `App.jsx`의 라우트로 먼저 확인할 것.
- 색상/폰트 등 디자인 토큰은 `tailwind.config.js`(primary `#4285F4` 등)와 `index.css`에 있음.

## 코드 컨벤션 (기존 패턴, 새 코드도 따를 것)

- **공유 API 클라이언트가 없다.** `requestApi`/`requestTokenRefresh`/`callAuthedApi`/`isSessionError` 같은 fetch 보일러플레이트가 페이지 파일마다 복붙되어 있음(18개 이상). 인증 흐름을 바꾸려면 `AuthContext.jsx` 하나만 고치면 안 되고 이 보일러플레이트가 있는 모든 파일을 확인해야 함. 새 `*Connected.jsx` 페이지를 만들 때도 이 패턴을 그대로 복붙해서 씀(리팩터링해서 공유 모듈로 뽑는 건 별도 논의 없이 하지 말 것).
- 인증 토큰: `accessToken`은 메모리(AuthContext state) + localStorage(`joyhill.auth`), `refreshToken`은 httpOnly 쿠키 + `X-Refresh-Token` 헤더 폴백(iOS PWA에서 쿠키 유지 안 되는 문제 대응).
- 목록/작성 페이지 쌍은 라우터 state로 데이터를 주고받는 패턴(`navigate('/x/write', { state: { mode: 'edit', note } })`) — 별도 fetch-by-id 없이 목록에서 이미 받아온 객체를 그대로 넘김.

## contentEditable 리치 텍스트를 쓸 때 주의

`SermonNoteWritePage.jsx`의 에디터가 유일한 contentEditable 사용처. **네이티브 Enter 키 동작에 의존하면 안 됨** — 실사용자 환경에서 Enter를 눌러도 줄바꿈이 아예 안 생기는 경우가 있어(모바일 웹뷰 계열 추정), `onKeyDown`에서 Enter를 가로채 `execCommand('insertLineBreak')`(리스트 안이면 `insertParagraph`)로 명시적으로 처리해야 함. 목록 자동 서식(`- `/`1. ` 트리거), 하이라이트 토글(DOM 직접 확인 후 적용/제거) 패턴도 이 파일 참고. 다른 작성 화면(공지/기도)은 전부 네이티브 `<textarea>`라 이 문제가 없음 — 앞으로도 멀티라인 입력은 특별한 이유 없으면 `<textarea>`를 쓰고, contentEditable은 서식(굵게/색상 등)이 꼭 필요할 때만 쓸 것.

## 로컬 개발

```
npm run dev -- --port 5173 --strictPort
```
**반드시 5173 포트**로 띄울 것 — 백엔드(JOYHILL_BE)의 CORS 허용 origin이 `localhost:5173`/`localhost:3000`/운영 도메인뿐이라 다른 포트(예: 5174)는 인증 요청이 전부 403으로 막힘. `vite.config.js`의 dev proxy가 `/api`를 `http://localhost:8080`(로컬 백엔드)으로 넘겨줌.

`.claude/launch.json`(상위 `khh/` 디렉토리)에 `joyhill-fe-dev`(포트 5173)/`joyhill-be-dev`(JDK 21 경로 지정) 설정이 등록되어 있음.
