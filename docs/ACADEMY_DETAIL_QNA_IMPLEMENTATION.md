# Academy Detail Page & Q&A Implementation

## Overview
This document outlines the implementation details for the Academy Detail Page and its Q&A feature.

## Components

### 1. `AcademyDetailPage.tsx`
- **Route**: `/academies/:academyId`
- **Features**:
  - Displays academy details (header, overview, stats).
  - Tabbed interface: "상세 정보", "개설 과정", "Q&A".
  - **Q&A Tab**:
    - Integrates `AcademyQnAs` component.
    - Manages pagination state (`qnaPage`).
    - Fetches paginated data using `useQuery` and `fetchAcademyQnAs`.

### 2. `AcademyQnAs.tsx`
- **Props**:
  - `qnas`: List of Q&A items for the current page.
  - `totalCount`: Total number of Q&A items.
  - `page`: Current page number.
  - `onPageChange`: Callback to change the page.
  - `isLoading`: Loading state.
  - `onQuestionSubmit`: Callback for new question submission.
- **Features**:
  - Displays a list of Q&A items.
  - Expandable Q&A items to show content and answers.
  - "질문하기" button opens a form (`AcademyQnAForm`).
  - **Pagination UI**: Displays page numbers and next/prev buttons.

### 3. `AcademyQnAForm.tsx`
- **Props**:
  - `onSubmit`: Callback with title and content.
  - `onCancel`: Callback to close the form.
- **Features**:
  - Simple form with Title and Content inputs.
  - Validation for empty fields.

### 4. `MapEmbed.tsx`
- **Features**:
  - Displays a Google Map embed (iframe) for the given address.
  - Provides direct links to Naver Map and Kakao Map for better Korean localization.
  - No API key required for the basic embed.

## Data Fetching (`mockData.ts`)

### `fetchAcademyQnAs`
- **Signature**: `(academyId: number, page: number = 1, limit: number = 5) => Promise<{ qnas: AcademyQnA[], totalCount: number }>`
- **Behavior**:
  - Filters `mockAcademyQnAs` by `academyId`.
  - Sorts by `createdAt` (descending).
  - Returns a slice of the array based on `page` and `limit`.
  - Returns `totalCount` for pagination calculation.

## Design
- Consistent with `CourseDetailPage`.
- Uses Tailwind CSS for styling.
- Responsive design for mobile and desktop.
