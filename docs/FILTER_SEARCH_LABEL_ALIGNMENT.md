# 필터 디자인 개선 보고서 (검색바 라벨 추가)

## 1. 문제 상황
- **사용자 요구사항**: "검색에도 라벨을 붙여서 정렬을 맞춰"
- **기존 문제**: 드롭다운 필터에는 상단 라벨("교육 대상", "교육 방식")이 추가되었으나, 검색바에는 라벨이 없어 시각적인 높이(Vertical Rhythm)가 맞지 않고 정렬이 어긋나 보임.

## 2. 해결 방법
- **검색바 라벨 추가**:
  - 검색바(`input`) 위에도 드롭다운과 동일한 스타일(`text-xs font-semibold text-slate-500 ml-1`)의 라벨 "과정 검색"을 추가.
  - 검색바 컨테이너에 `flex flex-col gap-1.5`를 적용하여 드롭다운 컨테이너와 동일한 구조로 만듦.

## 3. 변경 코드 (`src/pages/CourseListPage.tsx`)

```tsx
{/* Search Bar */}
<div className="flex flex-col gap-1.5 flex-grow max-w-xl">
    {/* 라벨 추가 */}
    <label htmlFor="keyword" className="text-xs font-semibold text-slate-500 ml-1">과정 검색</label>
    
    <div className="relative">
        <input id="keyword" ... />
        <Search ... />
    </div>
</div>
```

## 4. 결과
- **시각적 정렬**: 검색바와 드롭다운 필터들의 상단 라벨 라인이 일치하게 되어, 전체적인 필터 UI가 정돈되고 균형 잡힌 모습을 갖춤.
- **일관성**: 모든 입력 요소(검색, 선택)가 "라벨 + 입력창" 형태의 일관된 디자인 패턴을 따르게 됨.

---
작성일: 2025년 11월 28일
작성자: Antigravity Agent
