# 모바일 메뉴 표시 오류 수정 보고서

## 1. 문제 상황
- **증상**: 모바일 화면에서 햄버거 버튼을 클릭했을 때 메뉴가 정상적으로 표시되지 않음.
- **원인 분석**:
  - `Header` 컴포넌트의 최상위 `header` 태그에 `backdrop-blur` (CSS filter) 속성이 적용되어 있음.
  - CSS 명세에 따르면, 부모 요소에 `filter`, `transform`, `perspective` 등의 속성이 적용되면, 해당 요소는 자식 `fixed` 요소의 **Containing Block(포함 블록)**이 됨.
  - 이로 인해 `fixed`로 설정된 모바일 메뉴 오버레이가 뷰포트(Viewport) 전체가 아닌, `header` 영역 내부나 엉뚱한 위치를 기준으로 배치되어 화면에 제대로 보이지 않거나 잘리는 현상이 발생함.

## 2. 해결 방법
- **구조 변경**:
  - 모바일 메뉴 오버레이(`div`)를 `header` 태그 **외부**로 이동시킴.
  - 이를 위해 `Header` 컴포넌트의 최상위 요소를 React Fragment (`<> ... </>`)로 변경하여 `header`와 오버레이가 형제 요소가 되도록 함.
  - 이제 오버레이는 `header`의 스타일(filter 등) 영향을 받지 않고 뷰포트를 기준으로 정상적으로 `fixed` 배치됨.

- **UX 개선 (스크롤 잠금)**:
  - 메뉴가 열려 있을 때 배경(본문)이 스크롤되는 것을 방지하기 위해 `useEffect`를 추가.
  - `isMobileMenuOpen` 상태에 따라 `document.body.style.overflow`를 `hidden` 또는 `unset`으로 토글.

## 3. 변경 코드 요약 (`src/components/layout/Header.tsx`)

```tsx
// 변경 전
<header className="...">
  <nav>...</nav>
  {isMobileMenuOpen && <div className="fixed inset-0 ...">...</div>}
</header>

// 변경 후
<>
  <header className="...">
    <nav>...</nav>
  </header>
  {isMobileMenuOpen && <div className="fixed inset-0 ...">...</div>}
</>
```

## 4. 결과
- 햄버거 버튼 클릭 시 모바일 메뉴가 화면 전체를 정상적으로 덮으며 표시됨.
- 메뉴가 열린 상태에서 배경 스크롤이 차단되어 사용자 경험이 향상됨.

---
작성일: 2025년 11월 27일
작성자: Antigravity Agent
