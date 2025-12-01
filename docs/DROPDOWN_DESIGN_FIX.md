# 드롭다운 디자인 개선 보고서

## 1. 문제 상황
- **증상**: 내비게이션 메뉴의 드롭다운이 단순히 공중에 떠 있는 박스처럼 보여, 어떤 상위 메뉴에 속해 있는지 시각적 연결성이 부족함.
- **요구사항**: 드롭다운임을 명확히 인지할 수 있도록 디자인 개선 (화살표/Caret 추가 등).

## 2. 해결 방법
- **Caret(화살표) 추가**:
  - 드롭다운 박스 상단(또는 측면)에 작은 삼각형 모양의 Caret을 추가하여, 해당 메뉴가 어디서 파생되었는지 시각적으로 연결함.
  - CSS `::before` 가상 요소와 `border` 속성을 활용하여 구현.
  
- **상세 구현**:
  - **메인 드롭다운 (세로형)**:
    - 박스 상단 중앙(또는 왼쪽)에 위쪽을 가리키는 화살표 추가.
    - `before:absolute before:-top-1.5 before:left-6 ...`
  - **서브 드롭다운 (가로형)**:
    - 박스 왼쪽 측면에 왼쪽을 가리키는 화살표 추가.
    - `before:absolute before:-left-1.5 before:top-4 ...`
  - **스타일**:
    - 배경색(`bg-white`)과 테두리(`border-slate-100`)를 드롭다운 박스와 일치시켜 자연스럽게 이어지도록 함.
    - `rotate-45`를 사용하여 사각형을 회전시켜 삼각형 모양을 만듦.

## 3. 변경 코드 (`src/components/layout/Header.tsx`)

```tsx
// 메인 드롭다운 예시
<div className="w-64 bg-white ... relative before:absolute before:-top-1.5 before:left-6 before:w-3 before:h-3 before:bg-white before:border-t before:border-l before:border-slate-100 before:rotate-45">
```

## 4. 결과
- 드롭다운 메뉴가 상위 메뉴와 시각적으로 연결되어 보임.
- 사용자가 메뉴의 계층 구조를 더 직관적으로 파악할 수 있음.

---
작성일: 2025년 11월 28일
작성자: Antigravity Agent
