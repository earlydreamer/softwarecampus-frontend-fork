# 메인 배너 텍스트 겹침 수정 보고서

## 1. 문제 상황
- **증상**: 메인 페이지 상단 배너(Hero Banner)의 텍스트가 좌우 내비게이션 화살표 버튼과 겹쳐서 가독성이 떨어짐.
- **원인**: 텍스트 컨테이너의 좌우 패딩(`px-6`, 약 1.5rem)이 충분하지 않아, 절대 위치(`absolute`)로 배치된 내비게이션 버튼 영역까지 텍스트가 확장됨.

## 2. 해결 방법
- **패딩 확대**:
  - 텍스트 컨테이너의 좌우 패딩을 대폭 늘려서 텍스트가 버튼 영역을 침범하지 않도록 안전거리(Safe Area)를 확보함.
  - **변경 전**: `px-6 md:px-12` (모바일 1.5rem, 데스크탑 3rem)
  - **변경 후**: `px-16 md:px-24` (모바일 4rem, 데스크탑 6rem)
  
- **수치 근거**:
  - 내비게이션 버튼은 화면 끝에서 `1rem`(`left-4`) 떨어져 있고, 버튼 자체 크기가 약 `3rem`임.
  - 따라서 최소 `4rem` 이상의 공간이 필요함.
  - `px-16` (4rem)을 적용하여 텍스트가 버튼과 겹치지 않도록 조치함.

## 3. 변경 코드 (`src/components/home/HeroBanner.tsx`)

```tsx
// 변경 전
<div className="relative h-full container mx-auto px-6 md:px-12 flex items-center">

// 변경 후
<div className="relative h-full container mx-auto px-16 md:px-24 flex items-center">
```

## 4. 결과
- 배너 텍스트가 내비게이션 버튼 안쪽으로 안전하게 배치됨.
- 화면 크기가 작아져도 텍스트와 버튼이 겹치지 않아 가독성과 심미성이 향상됨.

---
작성일: 2025년 11월 28일
작성자: Antigravity Agent
