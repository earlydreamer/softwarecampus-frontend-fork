# 소프트웨어 캠퍼스 - Frontend

부트캠프 및 교육기관의 과정을 소개하고, 수강 후기와 커뮤니티를 제공하는 웹사이트

## 🛠️ 기술 스택

- **React 19** + **TypeScript**
- **Vite** - 빌드 도구
- **React Router** - 라우팅
- **TanStack Query** - 서버 상태 관리
- **Zustand** - 클라이언트 상태 관리
- **Tailwind CSS** - 스타일링
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

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
