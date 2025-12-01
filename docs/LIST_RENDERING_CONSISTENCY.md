# 리스트 렌더링 일관성 개선 보고서

## 1. 문제 상황
- **사용자 피드백**: "어떤 경우는 4개 미만일때 빈 카드 영역이 나오고 어떤 경우는 빈 영역을 남겨. 일관성있게 한쪽으로 통일."
- **원인**: `CourseSection.tsx` 컴포넌트에서 데이터 개수가 4개 미만일 경우, 강제로 빈 박스(placeholder)를 렌더링하여 4칸을 채우는 로직이 존재했음. 반면 `CommunitySection.tsx` 등 다른 컴포넌트는 데이터 개수만큼만 렌더링하고 나머지는 빈 공간(whitespace)으로 둠.

## 2. 해결 방법
- **빈 박스(Placeholder) 제거**:
  - `CourseSection.tsx`에서 개수가 부족할 때 빈 박스를 추가하는 로직(`placeholdersCount`)을 제거함.
  - 이제 데이터가 1개면 1개만 렌더링되고, 나머지 공간은 자연스럽게 비워짐.
  
- **로딩 상태 유지**:
  - 데이터 로딩 중(`loading=true`)일 때는 여전히 4개의 스켈레톤(Skeleton) UI를 보여주어 로딩 중임을 명확히 함.

## 3. 변경 코드 (`src/components/home/CourseSection.tsx`)

```tsx
// 변경 전
const finalTarget = targetCount ?? Math.max(courses.length, 4);
const placeholdersCount = Math.max(finalTarget - courses.length, 0);
// ...
{Array.from({ length: placeholdersCount }).map(...) // 빈 박스 렌더링

// 변경 후
const finalTarget = targetCount ?? (loading ? 4 : courses.length);
// placeholdersCount 제거 및 빈 박스 렌더링 로직 삭제
```

## 4. 결과
- **일관성 확보**: 모든 리스트 컴포넌트(`CourseSection`, `CommunitySection`)가 데이터 개수만큼만 카드를 보여주는 방식으로 통일됨.
- **자연스러운 UI**: 특히 검색 결과가 1~2개일 때 불필요한 빈 박스가 보이지 않아 더 깔끔함.

---
작성일: 2025년 11월 28일
작성자: Antigravity Agent
