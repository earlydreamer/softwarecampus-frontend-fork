# 필터 드롭다운 디자인 적용 보고서

## 1. 문제 상황
- **요구사항**: "드롭다운으로 바꾸자." (이미지 첨부됨)
- **기존 디자인**: Chip(태그) 버튼 나열 방식은 직관적이나 공간을 차지하고, 모던한 앱 스타일(토스, 배민 등)의 드롭다운 필터와는 거리가 있었음.

## 2. 해결 방법
- **`FilterDropdown` 컴포넌트 구현**:
  - 재사용 가능한 드롭다운 컴포넌트를 `CourseListPage.tsx` 내부에 구현.
  - `useState`와 `useRef`를 사용하여 드롭다운 열림/닫힘 상태 및 외부 클릭 감지(Click Outside) 기능 구현.
  - 선택된 값이 있을 경우 버튼 스타일을 강조(`bg-primary-50 text-primary-700`)하고, 버튼 텍스트를 선택된 옵션명으로 변경.
  
- **필터 UI 전면 교체**:
  - 기존의 라벨 + 버튼 나열 방식을 제거.
  - 검색바와 드롭다운 버튼들을 한 줄(모바일에서는 줄바꿈)에 배치하여 공간 효율성 극대화.
  - "교육 대상", "교육 방식" 두 가지 필터를 드롭다운으로 제공.

## 3. 변경 코드 (`src/pages/CourseListPage.tsx`)

```tsx
// FilterDropdown 컴포넌트
const FilterDropdown = ({ label, value, options, onChange }) => {
    // ... 상태 관리 로직
    return (
        <div className="relative">
            <button onClick={toggle}>
                {isActive ? selectedLabel : label}
                <ChevronDown />
            </button>
            {isOpen && (
                <div className="absolute ...">
                    {/* 옵션 목록 */}
                </div>
            )}
        </div>
    );
};

// 메인 컴포넌트 적용
<div className="flex flex-col md:flex-row gap-4">
    <SearchInput />
    <div className="flex flex-wrap gap-3">
        <FilterDropdown label="교육 대상" ... />
        <FilterDropdown label="교육 방식" ... />
    </div>
</div>
```

## 4. 결과
- **공간 절약**: 필터 옵션들이 드롭다운 안에 숨겨져 있어 초기 화면이 훨씬 깔끔해짐.
- **사용자 경험**: 익숙한 모바일 앱 스타일의 필터링 경험 제공.
- **확장성**: 추후 "지역", "비용" 등 다른 필터가 추가되더라도 드롭다운 버튼만 추가하면 되므로 레이아웃을 해치지 않음.

---
작성일: 2025년 11월 28일
작성자: Antigravity Agent
