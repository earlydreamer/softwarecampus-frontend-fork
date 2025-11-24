---
title: Frontend Technology Stacks
version: 1.3.0
last_updated: 2025-11-24 (KST)
maintainer: Gemini Agent
description: 소프트웨어캠퍼스 프런트엔드 애플리케이션에서 사용하는 핵심 기술 스택과 라이브러리
---

# 프런트엔드 기술 스택 요약

**최종 점검일** 2025년 11월 24일 (KST)

---

### **코어 (Core)**

| 구분 | 사용 기술 | 버전 | 라이선스 | 추가/수정일 |
|---|---|---|---|---|
| 프레임워크/라이브러리 | React | 19.2.0 | MIT | (2025-10-12 추가) |
| 빌드 도구 | Vite | 7.2.2 | MIT | (2025-11-24 업데이트) |
| 언어 | TypeScript | 5.9.3 | Apache 2.0 | (2025-10-25 업데이트) |

---

### **라우팅 (Routing)**

| 구분 | 사용 기술 | 버전 | 라이선스 | 추가/수정일 |
|---|---|---|---|---|
| 라이브러리 | React Router DOM | 7.9.6 | MIT | (2025-11-24 업데이트) |

**채택 이유:** SPA 내에서 페이지 간 이동 상태를 안정적으로 관리하고 URL 기반 탐색을 제공하기 위함.

---

### **스타일링 (Styling)**

| 구분 | 사용 기술 | 버전 | 라이선스 | 추가/수정일 |
|---|---|---|---|---|
| CSS 프레임워크 | Tailwind CSS | 3.4.17 | MIT | (2025-10-24 추가) |
| PostCSS | PostCSS | 8.5.6 | MIT | (2025-10-24 추가) |
| Autoprefixer | Autoprefixer | 10.4.22 | MIT | (2025-11-24 업데이트) |
| Utility 병합 | tailwind-merge | 3.4.0 | MIT | (2025-11-24 추가) |
| 조건부 클래스 | clsx | 2.1.1 | MIT | (2025-11-24 추가) |

**채택 이유:** Utility-first 접근으로 일관된 디자인 시스템과 빠른 UI 프로토타이핑을 지원.

---

### **상태 관리 (State Management)**

| 구분 | 사용 기술 | 버전 | 라이선스 | 추가/수정일 |
|---|---|---|---|---|
| 전역 상태 | Zustand | 5.0.8 | MIT | (2025-11-24 업데이트) |

**채택 이유:** 경량 상태 관리로, 인증 상태, 전역 UI 상태를 간결하게 유지.

**사용 미들웨어:**
- `persist`: 인증 상태를 로컬 스토리지에 영구 저장

---

### **데이터 패칭 & 서버 상태 관리 (Data Fetching)**

| 구분 | 사용 기술 | 버전 | 라이선스 | 추가/수정일 |
|---|---|---|---|---|
| 서버 상태 | TanStack Query | 5.90.10 | MIT | (2025-11-24 업데이트) |
| HTTP 클라이언트 | Axios | 1.13.2 | MIT | (2025-10-24 추가) |

**채택 이유:** 비동기 데이터 캐싱, 로딩/에러 상태 관리, 재검증 등을 체계적으로 처리하기 위함.

---

### **폼 관리 (Form Handling)**

| 구분 | 사용 기술 | 버전 | 라이선스 | 추가/수정일 |
|---|---|---|---|---|
| 라이브러리 | React Hook Form | 7.66.1 | MIT | (2025-11-24 업데이트) |

**채택 이유:** 불필요한 리렌더링을 최소화하고 간결한 API로 복합 입력 폼을 구성하기 위함.

---

### **리치 텍스트 에디터 (Rich Text Editor)**

| 구분 | 사용 기술 | 버전 | 라이선스 | 추가/수정일 |
|---|---|---|---|---|
| 에디터 코어 | @tiptap/react | 3.11.0 | MIT | (2025-10-25 추가) |
| 기본 확장 | @tiptap/starter-kit | 3.11.0 | MIT | (2025-10-25 추가) |
| Placeholder | @tiptap/extension-placeholder | 3.11.0 | MIT | (2025-10-25 추가) |
| Link | @tiptap/extension-link | 3.11.0 | MIT | (2025-10-25 추가) |
| Image | @tiptap/extension-image | 3.11.0 | MIT | (2025-10-25 추가) |
| Color | @tiptap/extension-color | 3.11.0 | MIT | (2025-11-24 추가) |
| Highlight | @tiptap/extension-highlight | 3.11.0 | MIT | (2025-11-24 추가) |
| Text Style | @tiptap/extension-text-style | 3.11.0 | MIT | (2025-11-24 추가) |
| Text Align | @tiptap/extension-text-align | 3.11.0 | MIT | (2025-11-24 추가) |
| Underline | @tiptap/extension-underline | 3.11.0 | MIT | (2025-11-24 추가) |
| Task List | @tiptap/extension-task-list | 3.11.0 | MIT | (2025-11-24 추가) |
| Task Item | @tiptap/extension-task-item | 3.11.0 | MIT | (2025-11-24 추가) |

**채택 이유:** 커뮤니티 게시판 글쓰기/수정 기능에 사용. 경량화되고 확장 가능한 구조.

---

### **애니메이션 (Animation)**

| 구분 | 사용 기술 | 버전 | 라이선스 | 추가/수정일 |
|---|---|---|---|---|
| 애니메이션 라이브러리 | Framer Motion | 12.23.24 | MIT | (2025-11-24 추가) |

**채택 이유:** 선언적 애니메이션 API로 부드러운 UI 전환 효과 구현.

---

### **아이콘 (Icons)**

| 구분 | 사용 기술 | 버전 | 라이선스 | 추가/수정일 |
|---|---|---|---|---|
| 아이콘 라이브러리 | Lucide React | 0.554.0 | ISC | (2025-11-24 추가) |

**채택 이유:** 경량, 커스터마이징 가능, 일관된 디자인.

---

### **보안 (Security)**

| 구분 | 사용 기술 | 버전 | 라이선스 | 추가/수정일 |
|---|---|---|---|---|
| HTML Sanitizer | DOMPurify | 3.3.0 | MPL-2.0/Apache-2.0 | (2025-11-24 추가) |

**채택 이유:** XSS 공격 방지를 위한 HTML 살균 처리.

**주요 기능:**
- `sanitizeInput()`: 사용자 입력 HTML 살균
- `sanitizeUrl()`: URL 검증 (javascript:, data: 차단)

---

### **테스팅 (Testing)**

| 구분 | 사용 기술 | 버전 | 라이선스 | 추가/수정일 |
|---|---|---|---|---|
| 테스트 러너 | Vitest | 3.0.5 | MIT | (2025-11-24 추가) |
| UI 테스팅 | @vitest/ui | 3.0.5 | MIT | (2025-11-24 추가) |
| React 테스팅 | @testing-library/react | 16.1.0 | MIT | (2025-11-24 추가) |
| DOM 매처 | @testing-library/jest-dom | 6.6.3 | MIT | (2025-11-24 추가) |
| 사용자 이벤트 | @testing-library/user-event | 14.5.2 | MIT | (2025-11-24 추가) |
| DOM 시뮬레이션 | jsdom | 25.0.1 | MIT | (2025-11-24 추가) |

**채택 이유:** Vite와 네이티브 통합, 빠른 테스트 실행, React Testing Library와 호환.

---

### **린팅 & 포매팅 (Linting & Formatting)**

| 구분 | 사용 기술 | 버전 | 라이선스 | 추가/수정일 |
|---|---|---|---|---|
| 린터 | ESLint | 9.39.1 | MIT | (2025-11-24 추가) |
| ESLint Config | @eslint/js | 9.39.1 | MIT | (2025-11-24 추가) |
| TypeScript ESLint | typescript-eslint | 8.46.3 | MIT | (2025-11-24 추가) |
| React Hooks 플러그인 | eslint-plugin-react-hooks | 7.0.1 | MIT | (2025-11-24 추가) |
| React Refresh 플러그인 | eslint-plugin-react-refresh | 0.4.24 | MIT | (2025-11-24 추가) |

---

### **타입 정의 (Type Definitions)**

| 구분 | 사용 기술 | 버전 | 라이선스 | 추가/수정일 |
|---|---|---|---|---|
| React 타입 | @types/react | 19.2.2 | MIT | (2025-11-24 업데이트) |
| React DOM 타입 | @types/react-dom | 19.2.2 | MIT | (2025-11-24 업데이트) |
| Node 타입 | @types/node | 24.10.0 | MIT | (2025-11-24 업데이트) |
| DOMPurify 타입 | @types/dompurify | 3.0.5 | MIT | (2025-11-24 추가) |

---

### **개발 도구 (Development Tools)**

| 구분 | 사용 기술 | 버전 | 라이선스 | 추가/수정일 |
|---|---|---|---|---|
| Vite React 플러그인 | @vitejs/plugin-react | 5.1.0 | MIT | (2025-10-12 추가) |

---

### **환경변수 정책 (Environment Variables)**

**보안 원칙:**
- 클라이언트 코드에 노출되는 환경 변수는 **반드시 `VITE_` 접두사**를 사용해야 합니다.
- `vite.config.ts`에서 `loadEnv()` 호출 시 세 번째 인자를 `'VITE_'`로 설정하여 민감한 서버 측 환경 변수가 클라이언트에 노출되지 않도록 방지합니다.

---

### **주요 업데이트 내역 (2025-11-24)**

- **Vite**: 7.1.12 → 7.2.2 (마이너 업데이트)
- **React Router DOM**: 7.9.4 → 7.9.6 (마이너 업데이트)
- **React Hook Form**: 7.54.0 → 7.66.1 (마이너 업데이트)
- **TanStack Query**: 5.66.0 → 5.90.10 (마이너 업데이트)
- **Zustand**: 5.0.3 → 5.0.8 (패치 업데이트)
- **TypeScript 프로젝트 레퍼런스**: `composite: true` 추가 (tsconfig.app.json, tsconfig.node.json)
- **보안 라이브러리 추가**: DOMPurify 3.3.0
- **테스팅 스택 완비**: Vitest + React Testing Library
- **디자인 유틸리티 추가**: clsx, tailwind-merge
- **리치 텍스트 에디터 확장**: Tiptap 추가 익스텐션 (Color, Highlight, Task List 등)

---

> ※ 백엔드 기술 스택은 `BACKEND-STACKS.md`에 정리합니다.
> ※ 디자인 시스템은 `DESIGN-SYSTEM.md`에 문서화되어 있습니다.

