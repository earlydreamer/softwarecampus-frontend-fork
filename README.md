# 소프트웨어 캠퍼스 - Frontend

부트캠프 및 교육기관의 과정을 소개하고, 수강 후기와 커뮤니티를 제공하는 웹사이트

## 🛠️ 기술 스택

- **React 19.2.1** + **TypeScript** (보안 업데이트 반영)
- **Vite 7** - 빌드 도구
- **React Router 7** - 라우팅
- **TanStack Query 5** - 서버 상태 관리
- **Zustand 5** - 클라이언트 상태 관리
- **Tailwind CSS 3.4** - 스타일링
- **Vitest** + **React Testing Library** - 테스팅

## 📦 설치 및 실행

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

## 🧪 테스트

이 프로젝트는 **Vitest**와 **React Testing Library**를 사용하여 테스트를 작성합니다.

### 테스트 실행

```bash
# 모든 테스트 실행 (1회)
npm test

# Watch 모드로 테스트 실행
npm run test:watch

# UI 모드로 테스트 실행
npm run test:ui

# 코드 커버리지 확인
npm run test:coverage
```

### 테스트 작성 예시

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('컴포넌트가 정상적으로 렌더링되어야 함', () => {
    render(
      <BrowserRouter>
        <MyComponent />
      </BrowserRouter>
    );

    expect(screen.getByText('예상 텍스트')).toBeInTheDocument();
  });
});
```

### 테스트 파일 위치

- 단위 테스트: `src/__tests__/` 또는 컴포넌트와 같은 디렉토리에 `*.test.tsx`
- 설정 파일: `vitest.config.ts`
- 테스트 환경 초기화: `src/setupTests.ts`

## 📝 코드 품질

```bash
# ESLint 실행
npm run lint
```

## 🏗️ 프로젝트 구조

```
src/
├── components/        # 재사용 가능한 컴포넌트
├── pages/            # 페이지 컴포넌트
├── services/         # API 서비스 및 비즈니스 로직
├── stores/           # Zustand 상태 관리
├── types/            # TypeScript 타입 정의
├── utils/            # 유틸리티 함수
├── __tests__/        # 테스트 파일
└── setupTests.ts     # 테스트 환경 설정
```

## React + TypeScript + Vite 환경 설정

이 템플릿은 Vite를 사용하여 React 및 TypeScript 개발을 위한 최소한의 설정을 제공합니다. HMR(Hot Module Replacement)과 기본적인 ESLint 규칙이 포함되어 있습니다.

### 현재 적용된 플러그인

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react): Babel을 사용하여 Fast Refresh를 지원합니다.

### React Compiler

이 템플릿에는 React Compiler가 기본적으로 활성화되어 있지 않습니다. 개발 및 빌드 성능에 영향을 줄 수 있으므로, 필요 시 [공식 문서](https://react.dev/learn/react-compiler/installation)를 참고하여 설정하세요.

### ESLint 설정 확장

프로덕션 레벨의 애플리케이션을 개발하는 경우, 타입 인식이 가능한 린트 규칙을 활성화하는 것을 권장합니다.
`eslint.config.js` 파일에서 `tseslint.configs.recommendedTypeChecked` 또는 `strictTypeChecked`를 확장하여 사용할 수 있습니다.
또한 `eslint-plugin-react-x`나 `eslint-plugin-react-dom` 같은 추가 플러그인을 설치하여 React 전용 규칙을 강화할 수도 있습니다.
