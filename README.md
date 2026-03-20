# 소프트웨어 캠퍼스 - Frontend

> ⚠️ **포트폴리오 고지**: 사이트 개발 중 채택되지 않은 B안으로, 포트폴리오 용도로 사용을 허가받았습니다.

부트캠프 및 교육기관의 과정을 소개하고, 수강 후기와 커뮤니티를 제공하는 웹사이트입니다.

---

## 주요 기능

- 부트캠프 과정 목록 조회 및 카테고리별 필터링
- 수료증 인증 기반 수강 후기 열람 및 작성
- 개발자 커뮤니티 (게시판 / 댓글)
- 회원가입 · 로그인 · 프로필 관리

---

## 기술 스택 🛠️

| 구분 | 사용 기술 |
| --- | --- |
| UI | React 19 + TypeScript |
| 빌드 | Vite 7 |
| 라우팅 | React Router 7 |
| 서버 상태 | TanStack Query 5 |
| 클라이언트 상태 | Zustand 5 |
| 스타일링 | Tailwind CSS 3.4 |
| 테스트 | Vitest + React Testing Library |

**상태 관리 전략**: 서버 데이터(API 응답)는 TanStack Query로, UI 전역 상태(인증 정보 등)는 Zustand로 역할을 분리합니다.

---

## 설치 및 실행 📦

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

---

## 테스트 🧪

```bash
# 모든 테스트 실행
npm test

# Watch 모드
npm run test:watch

# 커버리지 확인
npm run test:coverage
```

- 단위 테스트: `src/__tests__/` 또는 컴포넌트 동일 디렉토리 내 `*.test.tsx`
- 설정 파일: `vitest.config.ts` / 환경 초기화: `src/setupTests.ts`

---

## 프로젝트 구조 🏗️

```
src/
├── components/    # 재사용 가능한 컴포넌트
├── pages/         # 페이지 컴포넌트
├── services/      # API 서비스 (백엔드 연동)
├── stores/        # Zustand 전역 상태
├── types/         # TypeScript 타입 정의
├── utils/         # 유틸리티 함수
└── __tests__/     # 테스트 파일
```

---

## 코드 품질

```bash
npm run lint
```
