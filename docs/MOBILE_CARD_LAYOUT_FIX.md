# 모바일 카드 레이아웃 수정 보고서

## 1. 문제 상황
- **증상**: 모바일 화면에서 강의 목록 페이지(`CourseListPage`)의 카드들이 가로 스크롤(Carousel) 형태로 표시됨.
- **사용자 피드백**: "모바일 페이지에서 폭을 줄여 카드가 1줄로 나올 때 가로 스크롤인 게 어색함."
- **원인**: `CourseSection` 컴포넌트가 모바일 환경에서 기본적으로 가로 스크롤을 사용하도록 설정되어 있었음. 이는 메인 페이지의 섹션 구성을 위한 것이었으나, 전체 목록을 보여주는 페이지에서는 부적절함.

## 2. 해결 방법
- **`CourseSection` 컴포넌트 확장**:
  - `viewMode` prop을 추가하여 레이아웃 모드를 제어할 수 있도록 개선.
  - `viewMode='carousel'` (기본값): 기존의 가로 스크롤 방식 유지 (메인 페이지용).
  - `viewMode='grid'`: 모바일에서도 세로 그리드(`grid-cols-1`) 방식으로 표시 (목록 페이지용).

- **`CourseListPage` 적용**:
  - `CourseSection`을 호출할 때 `viewMode="grid"`를 전달하여, 모바일에서도 카드가 세로로 나열되도록 변경.

## 3. 변경 코드

### `src/components/home/CourseSection.tsx`
```tsx
// viewMode prop 추가 및 클래스 분기 처리
const containerClasses = viewMode === 'carousel'
    ? "flex overflow-x-auto ..." // 가로 스크롤
    : "grid grid-cols-1 ...";    // 세로 그리드
```

### `src/pages/CourseListPage.tsx`
```tsx
// viewMode="grid" 전달
<CourseSection title="검색 결과" courses={courses} loading={isLoading} viewMode="grid" />
```

## 4. 결과
- 강의 목록 페이지에서 모바일 사용자는 익숙한 세로 스크롤 방식으로 모든 강의를 탐색할 수 있음.
- 메인 페이지의 가로 스크롤 섹션은 기존대로 유지되어, 페이지 성격에 맞는 최적의 UX 제공.

---
작성일: 2025년 11월 28일
작성자: Antigravity Agent
