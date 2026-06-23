# JOYHILL Frontend

> **청년부 주보 서비스 — 모바일 우선 PWA**

교회 청년부의 출석·통계·공지·기도·설교를 관리하는 React 기반 프론트엔드입니다.
마을/팸/사역팀 조직 구조와 역할 기반 권한을 갖춘 실서비스로, 약 200명이 사용 중입니다.

🔗 **[라이브 서비스](https://joyhill.kro.kr)** | [백엔드 레포](https://github.com/JOYHILLjubo/JOYHILL_BE)

---

## 주요 기능

- **출석 관리** — 주차별 출석 체크 및 출석률 통계 시각화
- **공지 & 기도 제목** — 조직 단위(전체/마을/팸) 공지 및 기도 제목 등록
- **설교 아카이브** — 주보 설교 내용 열람
- **역할 기반 화면** — member / 리더 / 총무 / admin 권한에 따라 노출 메뉴 분기
- **PWA** — 홈 화면 추가 후 앱처럼 사용 가능, 오프라인 기본 지원

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| **Framework** | React 18 · Vite |
| **언어** | TypeScript |
| **스타일링** | Tailwind CSS |
| **상태 관리** | React Query · Context API |
| **인증** | JWT (Access / Refresh Token) |
| **배포** | GitHub Actions → (배포 환경 기재) |
| **PWA** | Vite PWA Plugin |

---

## 시작하기

### 요구 사항

- Node.js 18+
- 백엔드 서버 실행 중 (또는 `.env`에 API URL 설정)

### 환경 변수

```env
VITE_API_BASE_URL=http://localhost:8080
```

### 설치 및 실행

```bash
npm install
npm run dev
```

### 빌드

```bash
npm run build
npm run preview
```

---

## 프로젝트 구조

```
src/
├── api/          # Axios 인스턴스 및 API 호출 함수
├── components/   # 공통 UI 컴포넌트
├── pages/        # 라우트별 페이지 컴포넌트
├── hooks/        # Custom React Hooks
├── store/        # 전역 상태 (Context / React Query)
├── types/        # TypeScript 타입 정의
└── utils/        # 공통 유틸 함수
```

---

## 관련 레포

| 레포 | 설명 |
|------|------|
| [JOYHILL_BE](https://github.com/JOYHILLjubo/JOYHILL_BE) | Spring Boot 4 · Java 21 백엔드 |

---

## 팀

**JOYHILLjubo** 조직 — 교회 청년부 서비스 개발팀
