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
- 폼 필수값 검증은 필드별 에러 상태(`fieldErrors` 객체)로 관리해서 어떤 항목이 비었는지 각 입력 바로 아래에 표시할 것 — 제출 버튼 하나 눌렀을 때 페이지 하단에 뭉뚱그린 에러 메시지 하나만 보여주는 방식은 지양 (`NoticeWritePageConnected.jsx` 참고, 2026-07-23).
- **카드 스타일은 공유 컴포넌트를 쓴다(위 API 클라이언트 규칙의 예외, 2026-07-23 사용자 승인)**: `components/Card.jsx`(흰/서페이스 배경 + `rounded-2xl` + `shadow-sm`, 테두리 없음)와 `components/SectionLabel.jsx`(작은 회색 eyebrow 스타일 섹션 제목)를 홈 화면 리디자인 이후 앱 전체 표준으로 채택함. 예전 스타일(`border border-gray-300 rounded-xl`)은 새로 만드는 화면에 쓰지 말 것. 단, 역할별 색상 배지가 필요한 `MyPage.jsx`의 `SectionHeader`(primary/success/warning/danger 색상 구분)처럼 의미가 다른 경우는 `SectionLabel`로 획일화하지 말 것 — 그건 별개의 용도.
- **`<input>`/`<textarea>`/`<select>`는 `index.css`에서 전역으로 `background: transparent; color: inherit;` 처리되어 있음** — 브라우저 기본 흰 배경이 다크/세피아 테마에서 흰 사각형으로 튀어보이는 문제 때문(2026-07-23). 특정 입력창에 명시적으로 다른 배경이 필요하면 그 요소에 직접 `bg-*` 유틸리티 클래스를 주면 됨(유틸리티 클래스가 이 전역 규칙보다 우선순위가 높음).

## contentEditable 리치 텍스트를 쓸 때 주의

`SermonNoteWritePage.jsx`의 에디터가 유일한 contentEditable 사용처. **네이티브 Enter 키 동작에 의존하면 안 됨** — 실사용자 환경에서 Enter를 눌러도 줄바꿈이 아예 안 생기는 경우가 있어(모바일 웹뷰 계열 추정), `onKeyDown`에서 Enter를 가로채 `execCommand('insertLineBreak')`(리스트 안이면 `insertParagraph`)로 명시적으로 처리해야 함. 목록 자동 서식(`- `/`1. ` 트리거), 하이라이트 토글(DOM 직접 확인 후 적용/제거) 패턴도 이 파일 참고. 다른 작성 화면(공지/기도)은 전부 네이티브 `<textarea>`라 이 문제가 없음 — 앞으로도 멀티라인 입력은 특별한 이유 없으면 `<textarea>`를 쓰고, contentEditable은 서식(굵게/색상 등)이 꼭 필요할 때만 쓸 것.

## textarea로 받은 멀티라인 텍스트를 표시할 때 `whitespace-pre-wrap`/`whitespace-pre-line` 빠뜨리지 말 것

`<textarea>`는 개행문자(`\n`)를 그대로 저장하지만, 화면에 표시하는 `<p>`/`<span>`은 기본 CSS(`white-space: normal`)가 개행을 무시해버려서 줄바꿈이 사라진 것처럼 보임. `NoticeDetailPageConnected.jsx`(공지 상세)는 처음부터 `whitespace-pre-line`이 붙어있었지만 `PrayerPageConnected.jsx`(개인/공동 기도제목 표시)엔 빠져있어서 실제 버그로 나타났다가 2026-07-23에 수정됨. 새로 textarea 기반 컨텐츠를 표시하는 화면을 만들 때마다 이 클래스가 있는지 확인할 것.

## PWA 업데이트 범위 — 뭐가 자동 반영되고 뭐가 "홈 화면에 추가"를 다시 해야 하는지

`vite.config.js`의 `VitePWA` 설정 기준:
- **백엔드 API 응답은 서비스워커 캐싱 대상이 아님**(`workbox.globPatterns`가 정적 자산 확장자만 포함, `/api/*`용 `runtimeCaching` 규칙 없음) — 백엔드만 고친 배포는 클라이언트 조치 없이 즉시 반영됨.
- **프론트 JS/CSS 변경**은 `registerType: 'autoUpdate'` + `skipWaiting: true` + `clientsClaim: true`라서 사용자가 앱을 다음에 열 때 자동으로 최신 버전으로 교체됨. 재설치 불필요.
- **"홈 화면에 추가"를 다시 해야 하는 경우는 딱 하나**: `manifest`(= `public/manifest.json`)에 정의된, 설치 시점에 OS가 스냅샷 떠서 저장해두는 값 — 앱 아이콘(`icons`), 이름(`name`/`short_name`), 테마/배경색(`theme_color`/`background_color`, iOS 스플래시 화면에 씀), `start_url`, `display` 모드. 이 값들을 바꿔도 이미 설치된 홈 화면 아이콘엔 반영 안 됨(특히 iOS Safari가 심함) — 사용자에게 재설치 안내가 필요한 유일한 케이스.

## 로컬 개발

```
npm run dev -- --port 5173 --strictPort
```
**반드시 5173 포트**로 띄울 것 — 백엔드(JOYHILL_BE)의 CORS 허용 origin이 `localhost:5173`/`localhost:3000`/운영 도메인뿐이라 다른 포트(예: 5174)는 인증 요청이 전부 403으로 막힘. `vite.config.js`의 dev proxy가 `/api`를 `http://localhost:8080`(로컬 백엔드)으로 넘겨줌.

`.claude/launch.json`(상위 `khh/` 디렉토리)에 `joyhill-fe-dev`(포트 5173)/`joyhill-be-dev`(JDK 21 경로 지정) 설정이 등록되어 있음.
