# 학원 상세 페이지 및 Q&A 기능 구현 문서

## 개요
이 문서는 학원 상세 페이지와 Q&A 기능의 구현 세부 사항을 설명합니다.

## 컴포넌트

### 1. `AcademyDetailPage.tsx`
- **경로**: `/academies/:academyId`
- **기능**:
  - 학원 상세 정보 표시 (헤더, 개요, 통계).
  - 탭 인터페이스: "상세 정보", "개설 과정", "Q&A".
  - **Q&A 탭**:
    - `AcademyQnAs` 컴포넌트 통합.
    - 페이지네이션 상태 관리 (`qnaPage`).
    - `useQuery`와 `fetchAcademyQnAs`를 사용한 페이지네이션 데이터 조회.

### 2. `AcademyQnAs.tsx`
- **Props**:
  - `qnas`: 현재 페이지의 Q&A 항목 목록.
  - `totalCount`: 전체 Q&A 항목 수.
  - `page`: 현재 페이지 번호.
  - `onPageChange`: 페이지 변경 콜백.
  - `isLoading`: 로딩 상태.
  - `onQuestionSubmit`: 새 질문 제출 콜백.
- **기능**:
  - Q&A 항목 목록 표시.
  - Q&A 항목 펼치기/접기 (내용 및 답변 표시).
  - "질문하기" 버튼으로 폼 열기 (`AcademyQnAForm`).
  - **페이지네이션 UI**: 페이지 번호 및 이전/다음 버튼 표시.

### 3. `AcademyQnAForm.tsx`
- **Props**:
  - `onSubmit`: 제목과 내용을 전달하는 콜백.
  - `onCancel`: 폼 닫기 콜백.
- **기능**:
  - 제목과 내용 입력 폼.
  - 빈 필드 유효성 검사.

### 4. `MapEmbed.tsx`
- **기능**:
  - 주어진 주소에 대한 Google 지도 임베드 (iframe) 표시.
  - 한국 사용자를 위한 네이버 지도 및 카카오맵 직접 링크 제공.
  - 기본 임베드에는 API 키 불필요.

## 데이터 조회 (`mockData.ts`)

### `fetchAcademyQnAs`
- **시그니처**: `(academyId: number, page: number = 1, limit: number = 5) => Promise<{ qnas: AcademyQnA[], totalCount: number }>`
- **동작**:
  - `academyId`로 `mockAcademyQnAs` 필터링.
  - `createdAt` 기준 내림차순 정렬.
  - `page`와 `limit`에 따른 배열 슬라이스 반환.
  - 페이지네이션 계산을 위한 `totalCount` 반환.

## 디자인
- `CourseDetailPage`와 일관된 디자인.
- Tailwind CSS 스타일링.
- 모바일 및 데스크톱 반응형 디자인.
