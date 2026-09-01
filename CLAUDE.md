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
- **터치 기기에서 "누른 색이 남는" 문제는 두 곳에서 온다**: 브라우저 기본 탭 하이라이트(`index.css`의 전역 `-webkit-tap-highlight-color: transparent`로 끔)와 Tailwind `hover:` 유틸리티(터치에서 한 번 누르면 hover가 눌러붙음 — `tailwind.config.js`의 `future.hoverOnlyWhenSupported: true`로 `@media (hover: hover)` 안에만 들어가게 함). 새 버튼을 만들 때 `hover:`는 그대로 써도 되고, 눌린 느낌이 필요하면 `:active`를 쓸 것.
- **아이콘은 이모지 대신 `lucide-react`를 쓸 것**(이미 설치돼 있고 `BottomNav.jsx`에서 사용 중). 이모지는 폰트/OS마다 렌더링이 달라 조잡해 보이고, 이 프로젝트 안에서도 두 아이콘 언어가 섞이면 통일감이 깨짐(2026-07-25, 설교노트 폴더 화면을 이모지→lucide 아이콘으로 교체하며 확정). `<select>`의 `<option>`처럼 React 컴포넌트를 못 넣는 자리는 예외.

## 아바타 / 프로필 사진

`components/BibleAvatars.jsx`에 성경 인물 아바타 **56종**(구약 32 / 신약 24)이 인라인 SVG 컴포넌트로 들어있다. 구조는 `BIBLE_AVATARS` 배열(key/label/category) + 컴포넌트 함수 + `SVG_MAP`(key→컴포넌트) 세 곳이며, **새 아바타를 추가하면 이 세 곳을 모두 건드려야 한다**(한 곳만 빠뜨리면 조용히 안 그려짐). 추가 후 정합성은 스크립트로 한 번에 확인할 수 있다 — 키/맵/컴포넌트 개수가 같은지, 고아 항목이 없는지, `clipPath` id가 중복되지 않는지.

- **`clipPath` id는 파일 전체에서 유일해야 한다.** 아바타 선택 모달은 56종을 **동시에 렌더링**하므로 id가 겹치면 다른 아바타의 클리핑이 적용돼 그림이 깨진다. `av-` 접두어 + 인물별 축약(`av-job`, `av-sml` …) 규칙을 따를 것.
- `BibleAvatarIcon`은 `avatarKey`(성경 인물)와 `photoUrl`(업로드한 내 사진)을 둘 다 받고 **photoUrl이 있으면 그걸 우선** 그린다. 둘 다 없으면 `null`을 반환하므로, 호출부는 `{(x.avatarKey || x.avatarPhotoUrl) ? <BibleAvatarIcon .../> : 이름첫글자}` 형태로 쓴다. 아바타 노출 지점이 9개 화면에 흩어져 있으니 렌더 방식을 바꿀 땐 전부 확인할 것.
- 아바타와 사진은 **상호 배타**다(서버에서도 강제 — 사진을 적용하면 `avatarKey`가 null이 되고, 아바타로 되돌리면 이전 S3 오브젝트가 삭제됨).

**사진은 업로드 전에 브라우저에서 512px/JPEG 0.85로 줄여서 보낸다(`MyPage.jsx`의 `downscalePhoto`)**. 서버(`S3Service`)에도 리사이징이 있지만 **nginx의 본문 크기 제한은 요청이 백엔드에 닿기 전에 걸리므로**(413) 서버 압축으로는 413을 막을 수 없다 — 클라이언트에서 미리 줄이는 게 실제 해법이다. 곁가지로 아이폰 HEIC도 canvas를 거치며 JPEG로 바뀌어 서버 디코딩 문제까지 피해간다. EXIF 회전 사진이 눕지 않도록 `createImageBitmap(file, { imageOrientation: 'from-image' })`를 쓰고 미지원 브라우저는 `img` 폴백을 탄다.

## AuthContext의 `normalizeUser()`는 화이트리스트다 — 유저 필드를 추가하면 여기도 반드시 추가할 것

`AuthContext.jsx`의 `normalizeUser()`가 API 응답에서 **명시적으로 나열한 필드만** 골라 담는다. 백엔드가 새 필드를 내려줘도 여기에 안 적으면 **조용히 버려진다** — 에러도 없고 네트워크 탭에는 값이 정상적으로 보이는데 화면에만 반영이 안 되는, 원인 찾기 까다로운 버그가 된다(2026-08-01 `avatarPhotoUrl` 추가 시 실제로 겪음: 사진을 저장해도 이니셜 fallback만 뜨는데 `/api/users/me` 응답에는 URL이 멀쩡히 들어있었음). `UserSummary`에 필드를 추가할 땐 BE DTO → `normalizeUser()` → 화면 순서로 확인할 것.

## 로그인 세션/토큰은 `src/api/session.js` 한 곳에서만 건드린다 (2026-08-31)

**localStorage(`joyhill.auth`)에 직접 쓰지 말 것.** 읽기는 `readSession()`, 쓰기는 `saveSession()`(항상 병합), 로그아웃은 `clearSession()`, 갱신은 `refreshSession()`을 쓴다.

배경 — "자동로그인이 가끔 혼자 풀린다"는 제보의 원인이 이 구조였다. 서버는 갱신할 때마다 refresh token을 새로 발급하고 옛것을 무효화하는데(BE `AuthService.refresh`의 슬라이딩 만료), 프론트에서는

1. 페이지마다 똑같은 `requestTokenRefresh`가 20벌 복붙돼 각자 localStorage를 직접 덮어쓰고 있었고,
2. 갱신 직후 호출하는 `setAccessToken()`이 `AuthContext`의 localStorage 동기화 effect를 깨웠는데, 그 effect가 **state에 남아있던 옛 refresh token으로 방금 저장한 새 토큰을 덮어썼다**(state에는 refreshToken을 갱신할 경로가 없었다). 기기에는 서버가 이미 버린 토큰만 남고, 다음에 앱을 켤 때 로그아웃됐다.
3. 화면 하나가 API를 여러 개 동시에 부르면 401도 동시에 나서 갱신 요청이 여러 번 나갔고, 먼저 도착한 요청이 회전을 끝내는 순간 나머지는 무효한 토큰을 들고 있게 됐다.

그래서 지금은 갱신 요청이 하나로 합쳐지고(single flight), 갱신 결과를 `subscribeTokens()`로 `AuthContext` state까지 전파한다. **AuthContext의 동기화 effect는 `saveSession()`으로 병합 저장하고, `refreshToken`은 값이 있을 때만 넘긴다.**

- **실패를 이유별로 구분한다.** `refreshSession()`은 `SessionError`를 던지고 `error.isExpired`(401/403)일 때만 세션을 버린다. 배포 중 502·서버 재시작 중 500·네트워크 끊김에 로그아웃시키면, 토큰은 멀쩡한데 하필 그 순간 앱을 연 사람만 재로그인해야 한다(push = 즉시 배포라 실제로 일어난다).
- **페이지들은 에러 메시지 문자열로 로그아웃 여부를 판단한다**(`isSessionError()`가 '세션이 만료'/'다시 로그인'을 찾는다). 그래서 만료가 아닌 실패의 메시지에는 그 문구를 절대 넣지 말 것 — 넣는 순간 잠깐 끊긴 것뿐인데 로그인 화면으로 튕긴다.
- `clearSession()`은 세대(epoch)를 올려서, 로그아웃 뒤 뒤늦게 도착한 갱신 응답이 세션을 되살리지 못하게 한다.

## contentEditable 리치 텍스트를 쓸 때 주의

`SermonNoteWritePage.jsx`의 에디터가 유일한 contentEditable 사용처. **네이티브 Enter 키 동작에 의존하면 안 됨** — 실사용자 환경에서 Enter를 눌러도 줄바꿈이 아예 안 생기는 경우가 있어(모바일 웹뷰 계열 추정), `onKeyDown`에서 Enter를 가로채 `execCommand('insertParagraph')`로 명시적으로 처리하고 실패하면 직접 `<br>`을 넣는다(아래 "엔터는 insertParagraph로" 항목 참고). 다른 작성 화면(공지/기도)은 전부 네이티브 `<textarea>`라 이 문제가 없음 — 앞으로도 멀티라인 입력은 특별한 이유 없으면 `<textarea>`를 쓰고, contentEditable은 서식(굵게/색상 등)이 꼭 필요할 때만 쓸 것.

**목록 자동 서식(`autoFormatListIfTriggered`)은 새 목록을 만들 때 네이티브 `execCommand('insertOrderedList'/'insertUnorderedList')`를 아예 쓰지 않는다(2026-07-25, 세 차례 버그 재현 끝에 확정)** — execCommand의 "현재 블록"판단이 이 에디터의 `<br>`로만 줄을 구분하는 구조와 근본적으로 안 맞아서, 계속 다른 모양으로 버그가 재발했음:
1. **이미 그 종류의 목록 안에 있는데 트리거 문자를 또 치면 execCommand가 "켜기"가 아니라 "꺼버리기"로 동작함** — 항목이 목록 밖으로 튕겨나가고 빈 `<li>`만 남음. 방어: `document.queryCommandState(...)`로 이미 같은 종류 목록 안인지 먼저 확인하고, 맞으면 트리거 문자만 지우고 끝(브라우저가 이미 번호/글머리를 붙여주고 있으니 더 할 일 없음).
2. **새 목록을 만들 때 execCommand가 "현재 줄"의 경계를 못 찾는다** — 이 에디터는 줄바꿈을 `<br>`로만 표시하고(별도 `<p>`/`<div>` 없이) 시작하는데, execCommand는 이런 구조에서 (a) `<br>` 위의 이전 줄까지 통째로 한 `<li>`로 삼키거나(="그냥 텍스트 치다가 목록을 시작하면 위 줄에 합쳐진다"로 보고된 버그) (b) 근처의 무관한 기존 목록에 자동으로 합쳐버림(="목록을 빠져나와서 다시 번호를 치면 이전 목록 번호까지 틀어진다"). **해결: execCommand를 호출하지 않고 `<ul>`/`<ol><li>`를 직접 만든다.** 트리거가 있던 텍스트 노드의 부모 컨테이너(에디터 루트 자신이든, 목록 나온 뒤 생긴 `<div>`든 상관없이) 안에서 가장 가까운 앞뒤 `<br>` 사이 구간만 "이 줄"로 골라 그 노드들만 새 `<li>`로 옮기고, 남는 인접 `<br>`은 정리한다. (목록 안에서 Enter로 다음 항목을 만드는 것은 별개로 `handleEditorKeyDown`의 네이티브 `insertParagraph`가 처리하는데, 거긴 이 문제가 없어서 그대로 둠 — 새 목록을 "만드는" 순간에만 문제가 있었음.)
3. **번호는 항상 사용자가 실제로 타이핑한 숫자를 새 `<ol>`의 `start` 속성에 반영함** — 안 하면 새 `<ol>`이 생길 때마다 1부터 매겨져서, 빈 줄 몇 개 두고 "5."를 쳐도 "1."로 보이는 버그가 있었음.
4. **`onInput`에서 `e.nativeEvent.inputType`이 `delete`로 시작하면 자동 서식 로직을 아예 건너뜀** — 백스페이스로 텍스트를 지우다가 우연히 "- "/"1. "과 정확히 같은 모양이 남는 순간에도 input 이벤트는 뜨는데, 이때 트리거되면 사용자가 지우고 있는데 목록이 갑자기 생겨버림. `InputEvent.dispatchEvent`로 `inputType: 'deleteContentBackward'`를 직접 재현해서 확인함.

이 네 가지를 다 지키지 않고 단순히 `execCommand('insertOrderedList')`만 부르는 식으로 되돌리면 같은 버그들이 재발함 — "그냥 없애버리기"는 정답이 아니었고(한 번 그렇게 했다가 사용자가 "버그만 고치고 정렬 기능은 살려달라"고 되돌림), 위 네 가지 방어 로직이 실제 정답이었음.

**서식 토글 버튼(Bold/하이라이트)은 선택 영역이 없으면 아무것도 하지 않아야 함(2026-07-24)**: `applyBold`/`applyHighlight` 둘 다 순수 `document.execCommand(...)` 호출만 하고 커스텀 DOM 조작이 없음 — 이게 의도된 동작. 과거에 "커서만 놓고 하이라이트 버튼을 누르면 반응이 없다"는 걸 버그로 보고 조상 span을 직접 찾아 지우는 커스텀 로직을 넣었다가, 커서가 걸친 하이라이트 전체(문장 전체일 수도 있음)가 통째로 사라지는 훨씬 심각한 회귀를 만든 적 있음. 서식 버튼은 새로 추가하든 고치든 항상 이 방식(선택 영역 있을 때만 동작, 없으면 no-op)을 유지할 것 — Word/Google Docs 등 모든 리치에디터의 표준 동작과 같음.

**`execCommand('foreColor', ..., 'inherit')`는 하이라이트 끄기에 쓰는 `'inherit'`과 다르게 동작한다(2026-07-29)**: `hiliteColor`는 `'inherit'`을 넘기면 배경색이 정상적으로 제거되지만, `foreColor`에 똑같이 `'inherit'`을 넘기면 브라우저가 유효한 CSS 색상값으로 파싱하지 못해 글자색이 **투명**(`rgba(0,0,0,0)`)이 되어버림 — 다크모드에서 텍스트색 "기본" 스와치(예전엔 `#14162A` 고정값이라 다크 배경과 겹쳐 안 보였음)를 고치려다 발견함. **해결: `'inherit'` 대신 `getComputedStyle(editorRef.current).color`로 그 순간의 실제 테마 텍스트색을 구해서 그 값을 그대로 `foreColor`에 넘길 것.** 색상 관련 execCommand를 추가/수정할 때 커맨드마다 지원하는 특수 키워드가 다를 수 있다는 걸 가정하고, 반드시 실제로 적용된 결과(글자가 안 보이지 않는지)를 확인할 것 — 콘솔 에러 없이 조용히 실패(투명 처리)하는 종류의 버그라 눈으로 직접 봐야만 알 수 있음.

**본문은 저장·불러오기·붙여넣기 세 지점에서 `sanitizeEditorHtml()`을 통과시킨다 (2026-08-25)**: 이 에디터가 실제로 쓰는 서식(굵게/기울임/밑줄/목록/스와치 글자색/하이라이트)만 남기고 나머지 스타일·태그를 걷어내는 함수다. 두 가지 실제 오염원이 있어서 필요하다 — ①브라우저 기본 편집 동작이 `font-family`/`letter-spacing`을 하드코딩한 `<span>`을 본문에 끼워 넣는다(목록 첫 항목 맨 앞에서 백스페이스를 누르면 재현됨), ②밖에서 복사해 붙여넣으면 남의 색·배경·폰트·이미지가 그대로 들어와 다크/세피아에서 글자가 안 보이게 된다. **글자색은 `COLOR_SWATCHES`에 있는 값만 통과시키고 나머지는 지운다** — 이건 "기본" 색 스와치가 그 순간의 테마 텍스트색(라이트라면 `rgb(31,31,31)`)을 인라인으로 박아버리는 문제까지 같이 해결한다(그 노트를 다크모드에서 열면 어두운 배경에 어두운 글자가 됐었음). 배경색은 하이라이트 색과 같을 때만 남긴다.

**목록 자동 서식은 "커서가 속한 블록"을 찾아서 Range로 줄을 통째로 들어낸다 (2026-08-25)**: 예전엔 `node.parentElement`를 컨테이너로 삼았는데, 굵게/글자색이 켜진 상태에서 목록을 시작하면 트리거 텍스트가 `<b>`/`<span>` 안에 있어서 `<ul>`이 그 인라인 요소 안에 만들어졌다(`<b>제목<ul><li>…</li></ul></b>` — 잘못된 중첩 + 목록 전체가 굵어지고 윗줄과 한 덩어리가 됨, 실제 재현 확인). 지금은 `closestBlock()`으로 블록을 찾고, 그 블록 안에서 커서 앞뒤로 가장 가까운 `<br>` 사이를 `Range.extractContents()`로 들어낸다 — Range가 줄 경계에서 인라인 요소를 알아서 쪼개주기 때문에 이 문제가 원천적으로 없어진다. **새 목록은 반드시 블록의 직계 자식으로 넣을 것**(인라인 안에 블록을 넣으면 안 됨). 줄 경계였던 `<br>`은 `list.previousSibling`이 아니라 **찾아둔 `prevBr`/`nextBr` 참조로 직접 지운다** — 인라인 안에 들어있으면 형제가 아니라서 안 지워지고 빈 줄이 남는다.

**목록 첫 항목 맨 앞에서의 백스페이스만 직접 처리한다 (2026-08-25)**: 브라우저 기본 동작이 그 줄을 윗줄에 통째로 붙이면서 폰트 span까지 끼워 넣기 때문에(`첫줄<br><ul><li>항목</li></ul>` → `첫줄<span style="font-family:…">항목</span>`), `outdentIfAtListStart()`가 대신 "목록에서 한 단계 빠져나오기"로 처리한다(워드/노션과 같은 동작). **첫 항목이 아닐 땐 손대지 않는다** — 윗 항목과 합쳐지는 게 자연스럽고 그 경로는 오염도 없다.

**본문의 모든 줄은 `<div>` 블록으로 통일한다 — 이게 "가끔 줄이 -1되는" 버그의 진짜 원인이었다 (2026-08-26)**: `insertParagraph`로 바꾼 뒤에도 "가끔 줄이 밀리고 끝글자가 한 번 더 쳐진 것처럼 보인다, 규칙을 모르겠다"는 제보가 계속됐다. 원인은 한 본문 안에 **줄 표현이 세 가지가 섞여 있다는 것** — 맨 위 줄은 감싸지지 않은 생 텍스트, 엔터로 만든 줄은 `<div>`, 예전에 저장된 노트는 `<br>`. `insertParagraph`는 이 셋에서 각각 다르게 동작하고, 특히 **감싸지지 않은 첫 줄 중간에서 엔터를 치면 그 뒤의 `<div>` 줄들을 통째로 새 `<div>` 안에 중첩시킨다**(재현: `첫줄<div>둘째줄</div>`에서 `첫|줄` 위치 엔터 → `첫<div>줄<div>둘째줄</div></div>`). 커서가 어디 있었느냐에 따라 터지니 사용자에겐 "규칙이 없어" 보인다. **해결: `normalizeEditorBlocks()`로 모든 줄을 `<div>`로 맞춘다** — 본문을 불러올 때, 붙여넣은 뒤, 그리고 엔터를 처리하기 직전(`ensureBlockStructure()`)에 호출한다. 정규화는 노드를 새로 만들지 않고 옮기기만 하지만 커서가 에디터 루트를 가리키는 경우 자식 인덱스가 어긋나므로, 임시 표식 `<span>`을 심고 정규화 후 그 자리로 커서를 되돌린 다음 `editor.normalize()`로 쪼개진 텍스트 노드를 다시 붙인다. 예전 `<br>` 기반 노트도 열면 자동으로 정리된다.

**엔터는 `insertParagraph`로 처리한다 — `insertLineBreak`를 쓰면 "줄바꿈하고 타이핑하면 한 줄 위로 붙는" 버그가 난다 (2026-08-25, 실사용자 제보 → 재현 확인)**: 사용자가 "줄바꿈하고 타이핑 치면 그 전줄로 돌아간다, 전체적으로 -1줄"이라고 제보한 버그의 원인이다. `insertLineBreak`는 `<br>`만 하나 꽂아 넣는데, 브라우저는 문단 맨 끝에 눈에 안 보이는 보정용 `<br>`을 따로 관리한다 — 그 둘 사이에서 커서 위치가 어긋나면 다음에 친 글자가 이전 줄로 들어간다(데스크톱 크롬에서도 `가나다<br><br>` 상태에서 `<br>` 하나가 사라지는 걸 확인함). `insertParagraph`는 줄을 진짜 블록으로 쪼개서 빈 줄에도 실체가 있으므로 이 어긋남이 원천적으로 없고, 목록 안 엔터는 예전부터 이 명령을 쓰고 있었는데 거기서는 같은 제보가 없었다는 것도 근거다. 결과 구조는 `<div>` 블록 + 기존 `<br>` 줄이 섞이는데 둘 다 정상 렌더되고, 목록 자동서식(`closestBlock` 기반)도 블록을 제대로 인식한다.
**execCommand 실패 대비 폴백은 반드시 유지할 것** — Enter를 `preventDefault`로 먼저 가로채기 때문에 명령이 실패하면 엔터키가 통째로 죽는다. 반환값이 false거나 **본문이 실제로 안 바뀌었으면**(true를 돌려주고도 아무것도 안 하는 경우가 있다) `insertLineBreakManually()`로 직접 넣는다. 한글 조합 판정은 `isComposing` **과 `keyCode === 229`를 둘 다** 본다(안드로이드 키보드 일부가 `isComposing`을 안 채운다).

**주의 — 자동화 키 이벤트로는 이 동작을 검증할 수 없다**: 브라우저 자동화가 보내는 keydown은 contentEditable의 네이티브 편집(엔터/백스페이스)을 일으키지 않는다. 그래서 "엔터를 기본 동작에 맡기는" 방식은 로컬에서 검증이 불가능했다. 검증은 `document.execCommand('insertText'/'insertParagraph'/'delete')`로 실제 편집 경로를 태우고 렌더된 줄의 y좌표를 세는 방식으로 할 것.

**작성 화면의 하단 바는 `visualViewport`로 키보드를 피한다 (2026-08-25)**: iOS는 키보드가 떠도 `window.innerHeight`(레이아웃 뷰포트)가 그대로라 `position: fixed` 요소가 키보드 뒤로 숨고, 페이지가 스크롤될 때 같이 흔들린다. `window.visualViewport`의 `resize`/`scroll`을 듣고 `innerHeight - viewport.height - viewport.offsetTop`으로 가려진 높이를 구해 그만큼 `bottom`을 올린다(80px 이하는 주소창 접힘이므로 무시). 안드로이드는 보통 레이아웃 뷰포트가 같이 줄어서 이 값이 0이 되고 그게 맞는 동작이다.

**커서가 움직일 때마다 도는 코드에서 DOM을 만들지 말 것 (2026-08-25, 타이핑 버벅임의 원인)**: 툴바의 현재 서식 표시(`updateActiveFormats`)가 `selectionchange`마다 도는데, 예전 `colorsEqual`이 호출될 때마다 `<div>` 두 개를 만들어 `document.body`에 붙였다 떼면서 스타일 재계산을 강제로 일으켰다 — 한 글자 칠 때마다 10회 이상. 지금은 probe 엘리먼트 하나를 재사용 + 결과를 `Map`에 캐시하고(`normalizeColor`), `selectionchange`는 `requestAnimationFrame`으로 한 프레임에 한 번만 묶어서 처리하며, 계산 결과가 이전과 같으면 `setActiveFormats`에서 **같은 객체를 반환해 리렌더 자체를 건너뛴다**. 실측: 이벤트당 0.22ms/DOM 삽입 4회 → 0.006ms/0회.

**자동 임시저장은 로컬(localStorage)에만 한다 (2026-08-25)**: 키는 `joyhill.sermonNoteDraft.new` 또는 `joyhill.sermonNoteDraft.{noteId}`, 타이핑이 800ms 멈추면 저장한다. **서버 자동저장을 일부러 안 쓴다** — 저장 버튼을 누르지 않은 노트까지 목록에 만들어버리고, 모바일 네트워크에서 실패/재시도가 계속 생긴다. 막고 싶은 건 "쓰다가 나가서 통째로 날아가는" 상황이고 로컬 저장으로 충분하다. 화면에 들어올 때 임시저장본이 서버 내용과 다르면 복구하고 배너("저장하지 않고 나갔던 내용을 불러왔어요" + 원래대로)를 띄운다. **본 저장/삭제가 성공하면 반드시 `clearDraft()`** 할 것(안 지우면 다음에 들어올 때 또 복구된다). 7일 지난 임시저장본은 읽을 때 버린다.

## 설교노트 작성 화면은 카드가 아니라 "종이" 레이아웃이다 (2026-08-25, 시안 확정 후 반영)

이 화면만 루트 배경이 `bg-surface`다(다른 화면은 `page-bg` 위에 카드를 얹는 구조). 본문 에디터를 카드에 가두지 않고 종이에 바로 쓰는 느낌을 주기 위한 의도된 예외이므로, "카드 배경과 페이지 배경은 달라야 한다"는 전역 규칙을 이 화면에 적용하지 말 것.

- 섹션(말씀구절·적용할 점)은 카드 대신 **작은 이름표 + 가로 구분선 + 원형 `+` 버튼** 한 줄로 연다. 이름표가 항상 보이므로 담긴 게 없어도 무슨 자리인지 알 수 있다(점선 테두리 버튼은 "너무 흐릿하다"는 피드백으로 폐기됨).
- 서식 툴바와 저장 버튼은 화면 아래에 **떠 있는 알약 두 개**다. 툴바에는 `border border-gray-200`이 반드시 있어야 한다 — 배경이 `bg-surface`라서 다크 테마에서는 그림자가 안 보이고 페이지와 같은 색이 되어 경계가 사라진다(BottomNav와 같은 처방).
- 제목은 32px/900에 자간 `-0.055em`. 날짜·폴더는 채운 알약이 아니라 **테두리만 있는 조용한 알약**이라 본문 리듬을 방해하지 않는다.

## 업데이트 소식(릴리스 노트)은 `src/data/releaseNotes.js`에 쌓는다 (2026-08-26)

교인들에게 보여줄 "업데이트 소식" 화면을 만들 예정이라, 배포할 때마다 이 파일 맨 위에 항목을 추가한다.
**아직 화면은 없고 데이터만 있다** — 그래서 이 파일은 어디에서도 import되지 않고, 빌드하면 번들에서 통째로 빠진다(배포된 번들을 뒤져봐도 여기 문구는 안 나온다). 화면을 만들기 전까지 여기 문구를 고쳐도 앱 동작에는 아무 변화가 없다.

- 문구는 **개발 용어가 아니라 교인이 읽을 말**로 쓴다("insertParagraph로 교체" ❌ → "줄바꿈이 밀리던 문제를 고쳤어요" ⭕).
- `version`은 `package.json`의 `version`과 맞춘다(둘 다 올릴 것).
- `changes[].type`은 `new`(새 기능) / `improve`(개선) / `fix`(고침) 셋뿐이다.
- 사용자에게 안 보이는 내부 변경(리팩터링, 문서, 인프라)은 **적지 않는다** — 여긴 릴리스 노트지 커밋 로그가 아니다.

## 내 정보 화면 (`/my/profile`) — 개인정보는 여기서만 고친다 (2026-08-26)

마이페이지의 프로필 박스를 누르면 들어간다. 프로필 이미지(아바타/사진)와 이름·전화번호·생년월일을 여기서 바꾸고, 비밀번호 변경으로도 여기서 넘어간다.

- 서버는 `PATCH /api/users/me`(본인 전용, 이름/전화번호/생년월일만). 관리자용 `PUT /api/users/{id}`와 다른 엔드포인트다.
- **이름은 구글시트 동기화가 사람을 찾는 기준**이라, 화면에서 실명을 쓰도록 유도하고 동명이인은 A/B를 붙이도록 안내한다. 강제는 못 하니 시트 매칭이 어긋나면 이 경로를 의심할 것.
- **전화번호는 로그인 아이디**다. 바꾸면 다음 로그인부터 새 번호를 써야 하고, 중복 검사는 서버에서 건다.
- 생년월일은 저장 형식이 `YYMMDD`라 화면에서 `YYYY-MM-DD`와 변환한다. 두 자리 연도의 세기는 "미래 날짜일 수 없다"는 규칙으로 정한다. 달력 아이콘 자리에 `<input type="date">`를 투명하게 겹쳐뒀다 — `showPicker()` 지원이 갈려서 이렇게 두면 어느 브라우저든 기본 달력이 뜬다.
- 아바타 선택 시트는 `components/AvatarPickerSheet.jsx`. **예전에 MyPage 안에 인라인으로 있을 땐 배경이 `#ffffff` 하드코딩 + 존재하지 않는 CSS 변수(`--color-border-tertiary` 등)를 참조해서 다크·세피아에서 깨져 있었다** — 새로 시트/모달을 만들 때 이 실수를 반복하지 말 것.
- 최초 로그인 강제 비밀번호 설정(`/my/edit`, `passwordChanged === false`)은 예전 동작 그대로다 — 뒤로가기 없음, 저장 후 홈으로. 그 외에는 뒤로가기·저장 후 모두 `/my/profile`로 간다.

## 말씀구절은 성경 데이터에서 골라 담는다 (2026-08-25)

`src/data/bible.js`에 66권의 이름·장수·**장별 절수**가 들어있다(장 배열의 길이 = 장수, 원소 = 그 장의 절수). `components/VersePickerSheet.jsx`가 이걸로 책 → 장 → 절 순서의 바텀시트를 그린다.

- **절은 "시작 절 탭 → 끝 절 탭"의 범위 선택**이다(날짜 범위 고르는 방식). 같은 절을 두 번 누르면 한 절, `전체` 버튼은 1절~마지막 절. 태그 문자열은 `formatVerseTag()`가 만든다(`창세기 3:15-17` / `요한복음 3:16`).
- **구절은 여러 개 담을 수 있어야 해서 추가해도 시트가 안 닫힌다** — 책 목록으로 돌아가고, 담긴 구절은 시트 위쪽 칩으로 계속 보이며 거기서 바로 뺄 수 있다. 저장 형식은 예전 그대로 쉼표로 이은 문자열이라 기존 노트(자유 입력 태그)도 그대로 보인다.
- **`직접 입력` 모드를 남겨뒀다** — 목록에 없는 표기나 여러 구절을 한 줄로 적고 싶을 때가 있어서, 예전 자유 입력 기능을 없애지 않고 시트 안에 넣었다.
- **`src/data/bible.js`를 손대면 `node scripts/verify-bible.mjs`를 반드시 다시 돌릴 것.** 장별 절수 1,189개를 손으로 적으면 반드시 어딘가 틀린다 — 실제로 처음 작성했을 때 창세기·여호수아·열왕기상·열왕기하 4권이 틀렸고 이 스크립트가 잡아냈다. 검사는 권별 절수 합계(널리 알려진 값)와 총합 31,102절을 대조하는 방식이라 어느 권이 틀렸는지 바로 나온다.

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
- **`style={{...}}` 인라인 스타일로 색을 하드코딩한 곳은 테마 시스템이 전혀 안 먹힌다 (2026-07-28 전체 앱 점검에서 다수 발견/수정)**: `AttendanceStatsPageConnected`/`AttendancePage`/`AttendanceHistoryPage`/`VillageManagePageConnected`의 "온라인 출석" 관련 배지·카드가 `background: '#E6F4EA'` 같은 라이트모드 hex를 그대로 박아놔서 다크/세피아에서도 항상 밝은 배경으로 남아있던 버그가 있었음(className 기반 `bg-success-light` 등은 테마 대응이 되는데 인라인 hex만 안 됨) — `AttendanceHistoryPage`는 출석표 테이블 전체가 `style`로 짜여있어서 피해가 제일 컸음(다크모드에서 흰 사각형 테이블처럼 보임). **인라인 스타일에서 테마 대응 색이 필요하면 Tailwind 클래스 대신 `rgb(var(--jh-surface))`/`rgb(var(--jh-gray-500))`/`rgb(var(--jh-success-light))` 형태로 CSS 변수를 직접 참조할 것**(`index.css`의 트리플릿 변수를 `rgb()`로 감싸면 됨, `<alpha-value>` 문법은 Tailwind 전용이라 인라인에선 못 씀). 참고로 자주 쓰는 라이트모드 hex ↔ 토큰 대응: `#fff`→`surface`, `#FAFAFA`→`gray-50`, `#F5F5F5`/`#F0F0F0`→`gray-100`/`gray-200`, `#E0E0E0`→`gray-300`, `#CCCCCC`→`gray-700`, `#888`→`gray-500`, `#333`→`ink`. 브랜드 DEFAULT색(`#4285F4`/`#34A853`/`#F9AB00`/`#EA4335`)은 3테마 공통 고정값이라 인라인에 그대로 둬도 안전함 — `-light` 배경 변형만 문제가 됨. 앞으로 비슷한 하드코딩이 있는지 확인하려면 `grep -rn "style={{[^}]*#[0-9A-Fa-f]\{6\}" src/pages/` 실행할 것(`VillageManagePage.jsx`/`AttendanceStatsPage.jsx` 등 `Connected` 안 붙은 동명 파일은 `App.jsx`에 라우트가 없는 죽은 목업일 수 있으니 고치기 전에 라우트 여부부터 확인).
- **`bg-gray-100`을 페이지 배경 위에 직접 쓰면 라이트/세피아에서 카드가 안 보인다 (2026-07-29 발견/수정)**: `index.css`를 보면 라이트모드의 `gray-100`(#F5F5F5)이 `page-bg`(#F5F5F5)와 **완전히 같은 값**이고 세피아도 거의 차이가 없음 — 다크모드만 우연히 두 값이 크게 달라서 문제가 안 보였던 것. `.mobile-container` 배경과 카드 배경을 분리한 위 규칙과 같은 종류의 버그인데, 이번엔 inline style이 아니라 **className으로 `bg-gray-100`을 카드/버튼 배경에 그대로 쓴 경우**(`MyPage.jsx` 프로필 박스, `PrayerPageConnected.jsx` 주차선택 버튼, `VillageManagePageConnected.jsx` 미배정 토글, `SermonNoteWritePage.jsx` 날짜/폴더 선택 pill)였음. `NoticePageConnected.jsx`의 고정 공지 카드는 `bg-gray-100/50`(반투명)이라 더 안 보였음. **`bg-gray-100`/`bg-gray-50`은 카드 안에 얹히는 뱃지·hover 배경 등 "흰 카드 위" 용도로만 안전하고, 페이지 배경 위에 직접 놓이는 카드/버튼은 반드시 `bg-surface`(+ `shadow-sm`)를 써야 함.** 일반 카드와 구분되는 강조색이 필요할 땐(예: 고정 공지) `bg-gray-200`처럼 `page-bg`와 실제로 차이 나는 톤을 쓸 것.

## 하단 네비게이션바는 화면에 붙어있지 않고 "떠 있다" (2026-08-25)

`BottomNav.jsx`는 `bottom: 0`에 붙는 풀블리드 바가 아니라, 좌우 16px·아래 10px을 띄운 알약(`rounded-[26px]`) 형태다. 스타일은 `index.css`의 `.jh-floating-nav`에 있고, `backdrop-filter`를 지원하는 브라우저에서만 반투명+블러로 바뀐다(`@supports`로 감쌌으므로 미지원 브라우저는 불투명 배경이라 안전).

- **바깥 래퍼는 `pointer-events-none`, 안쪽 바만 `pointer-events-auto`**. 래퍼가 좌우 여백까지 폭을 차지하기 때문에, 안 그러면 바 옆 빈 공간이 그 아래 컨텐츠의 터치를 삼킨다.
- **바가 차지하는 높이는 아래에서부터 69px**(아래 여백 6 + 바 높이 63) + safe-area. 페이지들의 하단 패딩은 `calc(88px + env(safe-area-inset-bottom, 0px))`가 표준이다. 새 화면을 만들 때 이 값을 쓸 것. **바 크기나 위치를 바꾸면 이 패딩과 `AttendancePage`의 저장 알약 offset(현재 `bottom: 78px`, 패딩 90/150/196)도 같이 맞춰야 한다** — 안 맞추면 목록 맨 아래 항목이 가려진다.
- **아이폰에서는 홈 인디케이터 바로 위에 붙인다** — `bottom: max(6px, env(safe-area-inset-bottom, 0px))`. 예전처럼 안전영역 "위에 6px을 더" 띄우면 바와 홈 인디케이터 사이에 빈 띠가 생기고, 그 띠를 통해 아래 컨텐츠가 눌린다(래퍼가 `pointer-events-none`이라 통과됨). 안전영역이 없는 기기에서만 6px이 적용된다.
- 활성 탭은 아이콘 뒤에 `bg-primary-light` 알약이 깔리고 라벨이 `text-primary`가 된다. 라벨은 계속 유지한다(실사용자 연령대가 넓어서 아이콘만으로는 구분이 어렵다).

## 하단에 버튼이 필요한 화면은 네비게이션바를 없애지 말고 "위로 띄운다" (2026-08-25, 출석 화면)

예전 `AttendancePage.jsx`는 `fixed bottom-0` 저장 바가 화면 바닥을 통째로 차지해서 `BottomNav`를 아예 렌더링하지 않았다 — 리더가 출석 화면에 들어오면 다른 탭으로 이동할 방법이 ← 버튼뿐이었다. 지금은:

- `BottomNav`를 항상 렌더링하고, 저장 버튼은 **저장할 변경이 있을 때만** 네비 위로 떠오르는 알약(`.jh-save-pill`, `bottom: calc(80px + safe-area)`)이다. 변경 없음 → 버튼이 사라져 목록 공간이 넓어지고, 변경 있음 → "출석 저장하기 · N명 변경"으로 몇 명이 바뀌었는지까지 보여준다.
- 변경 여부는 `buildAttendanceSignature(members, map)`로 "마지막 저장 시점 서명"과 현재 상태를 비교해서 판단한다. **저장 요청을 만든 시점의 서명을 따로 잡아뒀다가 성공 시 그 값을 넣는다** — 저장 중에 체크를 더 건드린 걸 저장된 걸로 오해하면 안 되기 때문.
- **페이지 하단 패딩은 떠 있는 요소들의 실제 높이만큼 비운다**(저장 알약이 보일 때 152px, 에러 문구까지 뜨면 198px, 아닐 때 90px). 팸원이 많아 스크롤이 생겨도 맨 아래 사람이 버튼에 가려지면 안 된다 — 23명 리스트로 스크롤 끝까지 내려서 22px 여유가 남는 걸 확인함.

## 떠 있는 요소를 `transform`으로 움직인다면 가운데 정렬을 `transform`으로 하지 말 것 (2026-08-31)

`fixed left-1/2 -translate-x-1/2`는 이 앱에서 화면 중앙에 폭 430px짜리 바를 두는 표준 패턴인데, **같은 요소에 인라인 `style={{ transform: ... }}`을 주면 정렬이 통째로 사라진다.** 인라인 스타일이 클래스보다 우선하고 `transform`은 속성 하나라, `translateY`를 쓰는 순간 `translateX(-50%)`가 같이 날아간다.

`SermonNoteWritePage`의 하단 서식 툴바+저장 버튼이 이 문제로 화면 오른쪽 절반으로 밀려나 **저장 버튼이 화면 밖에 있었다**(v0.2.0에서 키보드 대응 `visualViewport` transform을 넣을 때 같이 들어갔다). 375px 화면에서 저장 버튼 왼쪽 끝이 x=501 — 즉 아예 누를 수 없었다.

- **`transform`을 쓰는 요소의 가로 정렬은 `fixed inset-x-0 mx-auto w-full max-w-[430px]`로 한다.** 정렬이 레이아웃 단계에서 끝나므로 `transform`을 마음대로 쓸 수 있다.
- 지금 `left-1/2 -translate-x-1/2`를 쓰는 나머지 화면들은 인라인 `transform`이 없어서 문제 없다. **새로 인라인 transform을 붙일 일이 생기면 정렬 방식부터 바꿀 것.**

## 키보드를 따라다니는 요소에는 transition을 걸지 말 것 (2026-09-01)

`SermonNoteWritePage`의 하단 바는 `visualViewport`를 읽어 키보드에 가려진 높이만큼 `transform`으로 올라간다. 여기에 `transition: transform 0.18s`가 걸려 있어서, **키보드는 가만히 있는데 바만 위아래로 떠다니는** 버그가 있었다(사용자 제보 영상에서 키보드 상단은 1프레임도 안 움직이는데 저장 버튼은 약 140px 폭으로 흔들림).

원인: 이 값은 "부드럽게 이동할 목표 위치"가 아니라 **"지금 화면이 실제로 어디에 있는지"**다. iOS는 글자를 칠 때마다 커서를 보이게 하려고 visual viewport를 위아래로 밀고(`offsetTop`이 바뀐다), 화면은 그 즉시 움직인다. 전환 효과가 걸려 있으면 바만 0.18초씩 뒤늦게 쫓아가므로, 타이핑하는 내내 어긋난 상태가 유지된다.

- **키보드가 뜨고 지는 순간에만** 전환 효과를 주고(그때는 목표 위치로의 이동이 맞다), 그 뒤 추적 중에는 `transition: none`으로 즉시 반영한다. 이전 상태를 `keyboardOpenRef`로 기억해서 판단한다.
- **`setState` 대신 ref로 DOM에 직접 쓴다.** 뷰포트 이벤트는 스크롤 한 번에 수십 번 오는데, 그때마다 리렌더를 돌리면 그 자체로 한 박자씩 밀린다. `requestAnimationFrame`으로 프레임당 한 번만 계산한다.
- 계산식 `window.innerHeight - visualViewport.height - visualViewport.offsetTop`은 그대로 맞다 — 문제는 식이 아니라 **반영 속도**였다.
- 검증: 키보드 열림(가림 336px) → 바 밑이 키보드 위 22px, `offsetTop`을 0→60→10으로 흔들어도 **화면상 위치가 454px로 고정**(예전에는 그때마다 애니메이션이 다시 시작됐다).

## 하단 고정 모달/시트를 만들 때 주의

`fixed inset-0` 오버레이 + `BottomNav`(`fixed bottom-0`, `z-50`)가 같은 화면에 있으면, 오버레이의 z-index가 `BottomNav`와 같거나 낮을 경우 **DOM에서 나중에 렌더링되는 쪽이 위로 그려짐** — `SermonNoteFolderListPage.jsx`의 폴더 추가 모달이 `<BottomNav />`보다 먼저(위쪽에) 렌더링되면서 같은 `z-50`이라 뷰포트가 좁아지면(키보드가 뜨는 등) `BottomNav`가 모달의 저장 버튼 위에 겹쳐 그려지는 버그가 있었음(2026-07-29). 새 모달을 만들 때는 오버레이 z-index를 `z-[60]`처럼 `BottomNav`보다 명시적으로 높게 줄 것 — DOM 순서에 기대지 말 것. 같은 커밋에서 모달 패널에 있던 불필요한 `mb-10`(바닥에서 40px 뜨는 마진)도 제거하고 `env(safe-area-inset-bottom)` 기반 패딩으로 바꿨음 — 하단 시트는 마진 없이 화면에 붙이고 안전영역은 패딩으로 처리할 것.

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
