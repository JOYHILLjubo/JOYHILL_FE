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
- 화면 시각 스타일(카드/배경/보더)을 바꿀 땐 기본적으로 앱 전체 적용을 전제로 할 것 — 자세한 배경은 아래 "테마 시스템" 절 참고.
- **아이콘은 이모지 대신 `lucide-react`를 쓸 것**(이미 설치돼 있고 `BottomNav.jsx`에서 사용 중). 이모지는 폰트/OS마다 렌더링이 달라 조잡해 보이고, 이 프로젝트 안에서도 두 아이콘 언어가 섞이면 통일감이 깨짐(2026-07-25, 설교노트 폴더 화면을 이모지→lucide 아이콘으로 교체하며 확정). `<select>`의 `<option>`처럼 React 컴포넌트를 못 넣는 자리는 예외.

## contentEditable 리치 텍스트를 쓸 때 주의

`SermonNoteWritePage.jsx`의 에디터가 유일한 contentEditable 사용처. **네이티브 Enter 키 동작에 의존하면 안 됨** — 실사용자 환경에서 Enter를 눌러도 줄바꿈이 아예 안 생기는 경우가 있어(모바일 웹뷰 계열 추정), `onKeyDown`에서 Enter를 가로채 `execCommand('insertLineBreak')`(리스트 안이면 `insertParagraph`)로 명시적으로 처리해야 함. 다른 작성 화면(공지/기도)은 전부 네이티브 `<textarea>`라 이 문제가 없음 — 앞으로도 멀티라인 입력은 특별한 이유 없으면 `<textarea>`를 쓰고, contentEditable은 서식(굵게/색상 등)이 꼭 필요할 때만 쓸 것.

**목록 자동 서식(`autoFormatListIfTriggered`)은 네이티브 `execCommand('insertOrderedList'/'insertUnorderedList')`의 두 가지 함정을 직접 방어해야 동작함(2026-07-25, 두 차례 버그 재현 후 확정)**:
1. **이미 그 종류의 목록 안에 있는데 트리거 문자를 또 치면 execCommand가 "켜기"가 아니라 "꺼버리기"로 동작함** — 목록 항목에서 다음 줄에 "- "나 "1. "을 또 타이핑하면(습관적으로), 그 항목이 목록 밖으로 튕겨나가고 빈 `<li>`만 남는 DOM 손상이 생김. 이게 "줄이 합쳐진다"고 보고된 버그의 진짜 원인이었음. 방어: `document.queryCommandState('insertOrderedList'/'insertUnorderedList')`로 이미 같은 종류 목록 안인지 먼저 확인하고, 맞으면 트리거 문자만 지우고 `execCommand`는 다시 부르지 않음.
2. **목록을 빠져나와서 쓴 문단이 나중에 다시 번호를 치면, 근처의 무관한 기존 목록에 execCommand가 자동으로 합쳐버림**(브라우저의 "인접한 같은 종류 목록과 병합" 동작) — 이전 목록 항목의 번호까지 같이 틀어짐. 방어: 트리거 전에 "원래 목록 안이 아니었는지" 기록해두고, `execCommand` 후 결과 `<ol>`/`<ul>`에 항목이 2개 이상이면(=원치 않게 합쳐진 것) 방금 만든 `<li>`만 떼어내 새 목록으로 분리.
3. **번호는 항상 사용자가 실제로 타이핑한 숫자를 목록의 `start` 속성에 반영함** — 안 하면 새 `<ol>`이 생길 때마다 브라우저가 무조건 1부터 매겨서, 빈 줄 몇 개 두고 "5."를 쳐도 "1."로 보이는 버그가 있었음.
4. **`onInput`에서 `e.nativeEvent.inputType`이 `delete`로 시작하면 자동 서식 로직을 아예 건너뜀** — 백스페이스로 텍스트를 지우다가 우연히 "- "/"1. "과 정확히 같은 모양이 남는 순간에도 input 이벤트는 뜨는데, 이때 트리거되면 사용자가 지우고 있는데 목록이 갑자기 생겨버림(신고된 "백스페이스하면 이상한 게 생긴다" 버그). `InputEvent.dispatchEvent`로 `inputType: 'deleteContentBackward'`를 직접 재현해서 확인함.

이 네 가지를 다 지키지 않고 단순히 `execCommand('insertOrderedList')`만 부르는 식으로 되돌리면 같은 버그들이 재발함 — "그냥 없애버리기"는 정답이 아니었고(한 번 그렇게 했다가 사용자가 "버그만 고치고 정렬 기능은 살려달라"고 되돌림), 위 네 가지 방어 로직이 실제 정답이었음.

**서식 토글 버튼(Bold/하이라이트)은 선택 영역이 없으면 아무것도 하지 않아야 함(2026-07-24)**: `applyBold`/`applyHighlight` 둘 다 순수 `document.execCommand(...)` 호출만 하고 커스텀 DOM 조작이 없음 — 이게 의도된 동작. 과거에 "커서만 놓고 하이라이트 버튼을 누르면 반응이 없다"는 걸 버그로 보고 조상 span을 직접 찾아 지우는 커스텀 로직을 넣었다가, 커서가 걸친 하이라이트 전체(문장 전체일 수도 있음)가 통째로 사라지는 훨씬 심각한 회귀를 만든 적 있음. 서식 버튼은 새로 추가하든 고치든 항상 이 방식(선택 영역 있을 때만 동작, 없으면 no-op)을 유지할 것 — Word/Google Docs 등 모든 리치에디터의 표준 동작과 같음.

## textarea로 받은 멀티라인 텍스트를 표시할 때 `whitespace-pre-wrap`/`whitespace-pre-line` 빠뜨리지 말 것

`<textarea>`는 개행문자(`\n`)를 그대로 저장하지만, 화면에 표시하는 `<p>`/`<span>`은 기본 CSS(`white-space: normal`)가 개행을 무시해버려서 줄바꿈이 사라진 것처럼 보임. `NoticeDetailPageConnected.jsx`(공지 상세)는 처음부터 `whitespace-pre-line`이 붙어있었지만 `PrayerPageConnected.jsx`(개인/공동 기도제목 표시)엔 빠져있어서 실제 버그로 나타났다가 2026-07-23에 수정됨. 새로 textarea 기반 컨텐츠를 표시하는 화면을 만들 때마다 이 클래스가 있는지 확인할 것.

## 테마 시스템 (라이트/다크/세피아, 2026-07-24 추가)

`ThemeContext.jsx`가 `document.documentElement`에 `data-theme` 속성을 설정하고 `localStorage`(`joyhill.theme`)에 저장함. 전환 UI는 `MyPage.jsx` 계정설정 섹션의 3단 버튼.

색상 토큰 구조(`tailwind.config.js` + `index.css`):
- `primary`/`success`/`warning`/`danger`의 **DEFAULT·hover·bar는 3테마 공통 고정값**(브랜드 일관성). 테마별로 바뀌는 건 각 색의 `-light`, `gray`(50~700만, `800`/`900`은 제외), 새로 추가된 `surface`(카드 배경)와 `ink`(진한 본문 텍스트) 토큰뿐.
- 값은 전부 `index.css`의 `:root`/`:root[data-theme="dark"]`/`:root[data-theme="sepia"]`에 "R G B" 공백구분 트리플릿으로 정의하고, config에서 `rgb(var(--jh-xxx) / <alpha-value>)`로 참조함 — 이래야 `bg-gray-100/50` 같은 투명도 모디파이어가 정상 동작함. 새 테마 토큰을 추가할 땐 반드시 이 트리플릿 형식을 지킬 것(단순 hex 문자열로 넣으면 `/alpha` 모디파이어가 깨짐).
- **`gray-800`/`gray-900`은 의도적으로 테마 미적용** — 영상 썸네일 placeholder 같은 "항상 어두운 배경" 용도로도 같이 쓰여서, 테마 반응시키면 다크모드에서 그 배경이 하얗게 뒤집히는 충돌이 생김. 진한 텍스트가 필요하면 `gray-900`이 아니라 `text-ink`를 쓸 것.
- **`white`도 의도적으로 안 건드림** — `text-white`(컬러 버튼 위 흰 글자)는 테마 불문 항상 흰색이어야 해서, 카드 배경(예전 `bg-white`)은 `bg-surface`를 대신 씀.
- **`.mobile-container`(앱 루트) 배경은 반드시 `page-bg`여야 하고 `surface`면 안 됨** — 카드(`bg-surface`+`shadow-sm`)가 배경과 같은 색이면 그림자만으로는 거의 안 보임. 새 최상위 레이아웃을 만들 때도 이 구분을 유지할 것.
- `<input>`/`<textarea>`/`<select>`는 `index.css`에서 전역으로 `background: transparent; color: inherit;` 처리됨(브라우저 기본 흰 배경이 다크/세피아에서 튀어보이는 문제 대응). 특정 입력창에 명시적 배경이 필요하면 그 요소에 직접 `bg-*` 클래스를 주면 우선 적용됨.

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
