# 강의 목록 필터 디자인 개선 보고서

## 1. 문제 상황
- **기존 디자인**: 기본 HTML `<select>` 드롭다운을 사용하여 모바일 친화적이지 않고, 옵션을 한눈에 보기 어려웠음.
- **요구사항**: 필터 디자인을 현대적이고 직관적으로 개선.

## 2. 해결 방법
- **UI 컴포넌트 변경**:
  - `<select>` 드롭다운을 **Chip(태그) 스타일 버튼**으로 변경.
  - 사용자가 모든 옵션(전체, 재직자, 취업예정자 등)을 한 번에 볼 수 있고, 원클릭으로 선택 가능하도록 함.
  
- **검색바 디자인 개선**:
  - 검색바를 더 크고 눈에 띄게 배치.
  - 배경색과 패딩을 조정하여 입력 편의성 증대.

- **레이아웃 재구성**:
  - 상단에 검색바를 배치하고, 하단에 필터 그룹(교육 대상, 교육 방식)을 가로로 배치하여 공간 활용도 높임.
  - 필터 그룹 간 구분선(`border-t`)을 추가하여 시각적 계층 구조 명확화.

## 3. 변경 코드 (`src/pages/CourseListPage.tsx`)

```tsx
// 변경 전 (Select)
<select {...register('categoryType')}>...</select>

// 변경 후 (Chip Buttons)
<div className="flex flex-wrap gap-2">
    {categoryTypes.map((cat) => (
        <button
            onClick={() => setValue('categoryType', cat.value)}
            className={`px-4 py-2 rounded-full ... ${watch('categoryType') === cat.value ? 'bg-primary-600 text-white' : 'bg-slate-100'}`}
        >
            {cat.label}
        </button>
    ))}
</div>
```

## 4. 결과
- **사용성 향상**: 클릭 횟수 감소 (드롭다운 열기 -> 선택 -> 닫기 vs 클릭 한 번).
- **가시성 향상**: 현재 선택된 필터와 선택 가능한 옵션이 한눈에 들어옴.
- **심미성 향상**: 모던한 앱 스타일의 UI 제공.

---
작성일: 2025년 11월 28일
작성자: Antigravity Agent
