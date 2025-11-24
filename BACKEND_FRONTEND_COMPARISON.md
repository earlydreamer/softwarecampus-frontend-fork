# 백엔드 스키마와 프론트엔드 Mock 데이터 비교

## Course (과정)

### 백엔드 스키마에 있는 필드
```java
- Long id
- Academy academy (ManyToOne)
- CourseCategory category (ManyToOne)
- String name
- LocalDate recruitStart
- LocalDate recruitEnd
- LocalDate courseStart
- LocalDate courseEnd
- Integer cost
- String classDay
- String location
- boolean isKdt
- boolean isNailbaeum
- boolean isOffline
- String requirement (TEXT)
- ApprovalStatus isApproved (enum)
- LocalDateTime approvedAt
- List<CourseCurriculum> curriculums (OneToMany)
- List<CourseReview> reviews (OneToMany)
- List<CourseQna> qnaList (OneToMany)
- List<CourseFavorite> favorites (OneToMany)
```

### 프론트엔드 전용 필드 (백엔드에 없음)
```typescript
- title?: string              // UI 표시용 제목 (name과 중복)
- institution?: string         // UI 표시용 기관명 (academy.name으로 대체 가능)
- duration?: string            // 기간 문자열 (courseStart~courseEnd로 계산 가능)
- format?: string              // "온라인/오프라인" 문자열 (isOffline으로 대체 가능)
- rating?: number              // 평점 (reviews 집계로 계산해야 함)
- reviewCount?: number         // 리뷰 수 (reviews.length로 계산해야 함)
- tags?: string[]              // 태그 배열 (백엔드에 별도 필드 없음)
- imageUrl?: string            // 과정 이미지 URL (백엔드에 없음)
- description?: string         // 과정 설명 (백엔드에 없음, requirement와 다름)
- highlights?: string[]        // 과정 하이라이트 (백엔드에 없음)
```

**권장사항**: 
- 백엔드에 `description` (TEXT), `imageUrl` (VARCHAR), `tags` (JSON or separate table) 필드 추가 검토
- `rating`, `reviewCount`는 계산 필드로 처리

---

## Academy (훈련기관)

### 백엔드 스키마에 있는 필드
```java
- Long id
- String name
- String address
- String businessNumber
- String email
- ApprovalStatus isApproved (enum)
- LocalDateTime approvedAt
```

### 프론트엔드 전용 필드 (백엔드에 없음)
```typescript
- description?: string         // 기관 소개 (백엔드에 없음)
- logoUrl?: string             // 로고 이미지 URL (백엔드에 없음)
- phone?: string               // 전화번호 (백엔드에 없음)
- website?: string             // 웹사이트 URL (백엔드에 없음)
- establishedDate?: string     // 설립일 (백엔드에 없음)
- courseCount?: number         // 운영 과정 수 (계산 필드)
- contentCount?: number        // 콘텐츠 수 (백엔드에 정의되지 않음)
- isRecruiting?: boolean       // 모집 중 여부 (백엔드에 없음)
- isUpdated?: boolean          // 최근 업데이트 여부 (백엔드에 없음)
- fields?: AcademyField[]      // 교육 분야 (백엔드에 없음)
- tags?: string[]              // 태그 (백엔드에 없음)
- rating?: number              // 평점 (계산 필드)
- reviewCount?: number         // 리뷰 수 (계산 필드)
```

**권장사항**:
- 백엔드에 `description` (TEXT), `logoUrl`, `phone`, `website`, `establishedDate` (LocalDate) 필드 추가 검토
- `fields`는 별도 테이블/JSON으로 관리 필요
- `isRecruiting`, `isUpdated`는 비즈니스 로직으로 계산 가능

---

## CourseCategory (과정 카테고리)

### 백엔드 스키마
```java
- Long id
- String categoryName
- CategoryType categoryType (enum: EMPLOYEE, JOB_SEEKER)
```

### 프론트엔드 사용
```typescript
- category: { id: number; name: string }
```

**현재 일치함** - 추가 필드 불필요

---

## 요약

### 즉시 추가 검토 필요한 백엔드 필드
1. **Course**
   - `description` TEXT
   - `imageUrl` VARCHAR(500)
   - `tags` JSON or separate `CourseTags` table

2. **Academy**
   - `description` TEXT
   - `logoUrl` VARCHAR(500)
   - `phone` VARCHAR(20)
   - `website` VARCHAR(200)
   - `establishedDate` DATE
   - `fields` JSON or separate `AcademyFields` table

### 계산 필드 (백엔드 API response에서 계산하여 제공)
- `rating` (reviews 평균)
- `reviewCount` (reviews count)
- `courseCount` (academy별 courses count)
- `duration` (courseStart ~ courseEnd 기간)
- `format` (isOffline 기반)
