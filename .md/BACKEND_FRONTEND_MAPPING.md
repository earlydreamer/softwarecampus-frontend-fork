# 백엔드-프론트엔드 명명 규칙 매핑 문서

## 개요
백엔드 엔티티 기준으로 프론트엔드의 변수명, 타입명, 엔드포인트를 통일하기 위한 매핑 문서입니다.

---

## 1. 타입명 매핑

| 백엔드 엔티티 | 프론트엔드 타입 (변경 전) | 프론트엔드 타입 (변경 후) | 비고 |
|--------------|------------------------|------------------------|------|
| `Account` | `UserProfile`, `SignupFormData` 등 | `Account`, `AccountCreateRequest` | 사용자 계정 통합 |
| `Academy` | `Academy` | `Academy` | 유지 |
| `Course` | `Course` | `Course` | 유지 |
| `Board` | `BoardPost` | `Board` | 게시글 엔티티 |
| `Comment` | `Comment` | `Comment` | 유지 |
| `AcademyQuestion` + `AcademyAnswer` | `AcademyQnA` | `AcademyQnA` | **프론트엔드에서 통합 타입으로 유지** |
| `CourseQuestion` + `CourseAnswer` | - | `CourseQnA` | **프론트엔드에서 통합 타입으로 유지** |
| `CourseReview` | - | `CourseReview` | 과정 후기 |
| `CourseFavorite` | `BookmarkedCourse` | `CourseFavorite` | 과정 즐겨찾기 |

---

## 2. 주요 필드명 매핑

### 2.1 Account (사용자 계정)

| 백엔드 필드 | 프론트엔드 필드 (변경 전) | 프론트엔드 필드 (변경 후) | 타입 |
|-----------|------------------------|------------------------|------|
| `userName` | `name`, `userName` | `userName` | `string` |
| `password` | `password` | `password` | `string` |
| `email` | `email` | `email` | `string` |
| `phoneNumber` | `phoneNumber`, `phone` | `phoneNumber` | `string` |
| `accountType` | `role` | `accountType` | `'USER' \| 'ACADEMY' \| 'ADMIN'` |
| `affiliation` | `company` | `affiliation` | `string?` |
| `position` | `department` | `position` | `string?` |
| `address` | `address` | `address` | `string?` |
| `accountApproved` | - | `accountApproved` | `ApprovalStatus` |

### 2.2 Academy (기관)

| 백엔드 필드 | 프론트엔드 필드 (변경 전) | 프론트엔드 필드 (변경 후) | 타입 |
|-----------|------------------------|------------------------|------|
| `name` | `name` | `name` | `string` |
| `address` | `address` | `address` | `string` |
| `businessNumber` | `businessNumber` | `businessNumber` | `string` |
| `email` | `email` | `email` | `string` |
| `isApproved` | `isVerified` | `isApproved` | `ApprovalStatus` |
| `approvedAt` | - | `approvedAt` | `string?` |

### 2.3 Course (과정)

| 백엔드 필드 | 프론트엔드 필드 (변경 전) | 프론트엔드 필드 (변경 후) | 타입 |
|-----------|------------------------|------------------------|------|
| `name` | `title` | `name` | `string` |
| `academy` | `institution` | `academy` | `Academy` (객체) |
| `category` | `category` | `category` | `CourseCategory` (객체) |
| `recruitStart` | - | `recruitStart` | `string` (LocalDate) |
| `recruitEnd` | - | `recruitEnd` | `string` (LocalDate) |
| `courseStart` | - | `courseStart` | `string` (LocalDate) |
| `courseEnd` | `duration` | `courseEnd` | `string` (LocalDate) |
| `cost` | - | `cost` | `number?` |
| `classDay` | - | `classDay` | `string?` |
| `location` | - | `location` | `string?` |
| `isKdt` | - | `isKdt` | `boolean` |
| `isNailbaeum` | - | `isNailbaeum` | `boolean` |
| `isOffline` | `format` 기반 | `isOffline` | `boolean` |
| `requirement` | - | `requirement` | `string?` |
| `isApproved` | - | `isApproved` | `ApprovalStatus` |

### 2.4 Board (게시글)

| 백엔드 필드 | 프론트엔드 필드 (변경 전) | 프론트엔드 필드 (변경 후) | 타입 |
|-----------|------------------------|------------------------|------|
| `category` | `category`, `board` | `category` | `BoardCategory` |
| `title` | `title` | `title` | `string` |
| `text` | `content` | `text` | `string` |
| `hits` | `viewCount` | `hits` | `number` |
| `isSecret` | - | `isSecret` | `boolean` |
| `comments` | - | `comments` | `Comment[]` |
| `boardRecommends` | `recommendCount` | `boardRecommends` | `BoardRecommend[]` |

### 2.5 Comment (댓글)

| 백엔드 필드 | 프론트엔드 필드 (변경 전) | 프론트엔드 필드 (변경 후) | 타입 |
|-----------|------------------------|------------------------|------|
| `text` | `content` | `text` | `string` |
| `topComment` | `parentId` | `topComment` | `Comment?` |
| `subComments` | - | `subComments` | `Comment[]` |
| `board` | `postId` | `board` | `Board` (객체) |

### 2.6 AcademyQnA (프론트엔드 통합 타입)

백엔드: `AcademyQuestion` + `AcademyAnswer` (분리)  
프론트엔드: `AcademyQnA` (통합 유지)

| 프론트엔드 필드 | 설명 | 타입 |
|---------------|------|------|
| `id` | 질문 ID | `number` |
| `academyId` | 기관 ID | `number` |
| `questionNumber` | 질문 번호 | `string` |
| `title` | 질문 제목 | `string` |
| `text` | 질문 내용 (`content` → `text`) | `string` |
| `answer?` | 답변 내용 | `string?` |
| `author` | 작성자 정보 | `{ id: number; userName: string; avatar?: string }` |
| `isApproved` | 승인 상태 | `ApprovalStatus` |
| `createdAt` | 작성일 | `string` |
| `updatedAt` | 수정일 | `string` |
| `answeredAt?` | 답변일 | `string?` |

### 2.7 CourseQnA (프론트엔드 통합 타입)

백엔드: `CourseQuestion` + `CourseAnswer` (분리)  
프론트엔드: `CourseQnA` (통합 유지)

| 프론트엔드 필드 | 설명 | 타입 |
|---------------|------|------|
| `id` | 질문 ID | `number` |
| `courseId` | 과정 ID | `number` |
| `title` | 질문 제목 | `string` |
| `text` | 질문 내용 | `string` |
| `answer?` | 답변 내용 | `string?` |
| `author` | 작성자 정보 | `{ id: number; userName: string; avatar?: string }` |
| `isApproved` | 승인 상태 | `ApprovalStatus` |
| `createdAt` | 작성일 | `string` |
| `updatedAt` | 수정일 | `string` |
| `answeredAt?` | 답변일 | `string?` |

---

## 3. API 엔드포인트 매핑

### 3.1 기관 (Academy)

| 기능 | 프론트엔드 엔드포인트 (변경 전) | 프론트엔드 엔드포인트 (변경 후) | 백엔드 엔드포인트 |
|------|----------------------------|----------------------------|-----------------|
| 목록 조회 | `/api/academy` | `/api/academies` | `GET /academies` |
| 검색 | `/api/academy/search` | `/api/academies/search` | `GET /academies/search` |
| 생성 | `/api/academy` | `/api/academies` | `POST /academies` |
| 상세 조회 | `/api/academy/:id` | `/api/academies/:id` | `GET /academies/:id` |
| 삭제 | `/api/academy/:id` | `/api/academies/:id` | `DELETE /academies/:id` |

### 3.2 과정 (Course)

| 기능 | 프론트엔드 엔드포인트 (변경 전) | 프론트엔드 엔드포인트 (변경 후) | 백엔드 엔드포인트 |
|------|----------------------------|----------------------------|-----------------|
| 목록 조회 | `/api/course` | `/api/courses` | `GET /api/courses` |
| 상세 조회 | `/api/course/:id` | `/api/courses/:id` | `GET /api/courses/:id` |
| 생성 | `/api/course` | `/api/courses` | `POST /api/courses` |

### 3.3 게시판 (Board)

| 기능 | 프론트엔드 엔드포인트 (변경 전) | 프론트엔드 엔드포인트 (변경 후) | 백엔드 엔드포인트 |
|------|----------------------------|----------------------------|-----------------|
| 목록 조회 | `/api/board/posts` | `/api/boards` | `GET /api/boards` |
| 상세 조회 | `/api/board/posts/:id` | `/api/boards/:id` | `GET /api/boards/:id` |
| 생성 | `/api/board/posts` | `/api/boards` | `POST /api/boards` |
| 수정 | `/api/board/posts/:id` | `/api/boards/:id` | `PUT /api/boards/:id` |
| 삭제 | `/api/board/posts/:id` | `/api/boards/:id` | `DELETE /api/boards/:id` |
| 추천 | `/api/board/posts/:id/recommend` | `/api/boards/:id/recommend` | `POST /api/boards/:id/recommend` |

### 3.4 댓글 (Comment)

| 기능 | 프론트엔드 엔드포인트 (변경 전) | 프론트엔드 엔드포인트 (변경 후) | 백엔드 엔드포인트 |
|------|----------------------------|----------------------------|-----------------|
| 댓글 목록 | `/api/board/posts/:id/comments` | `/api/boards/:boardId/comments` | `GET /api/boards/:boardId/comments` |
| 댓글 작성 | `/api/board/posts/:id/comments` | `/api/boards/:boardId/comments` | `POST /api/boards/:boardId/comments` |

### 3.5 계정 (Account)

| 기능 | 프론트엔드 엔드포인트 (변경 전) | 프론트엔드 엔드포인트 (변경 후) | 백엔드 엔드포인트 |
|------|----------------------------|----------------------------|-----------------|
| 회원가입 | `/api/auth/signup` | `/api/accounts` | `POST /api/accounts` |
| 로그인 | `/api/auth/login` | `/api/auth/login` | `POST /api/auth/login` |
| 내 정보 조회 | `/api/auth/me` | `/api/accounts/me` | `GET /api/accounts/me` |
| 정보 수정 | `/api/auth/me` | `/api/accounts/me` | `PUT /api/accounts/me` |

---

## 4. Enum 타입 매핑

### 4.1 AccountType (계정 유형)

```typescript
// 프론트엔드
type AccountType = 'USER' | 'ACADEMY' | 'ADMIN';

// 백엔드 (AccountType enum)
// USER, ACADEMY, ADMIN
```

### 4.2 ApprovalStatus (승인 상태)

```typescript
// 프론트엔드 (새로 추가)
type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITING';

// 백엔드
// PENDING, APPROVED, REJECTED, WAITING
```

### 4.3 BoardCategory (게시판 카테고리)

```typescript
// 프론트엔드 (변경 전)
type CommunityCategory = '공지사항' | '진로이야기' | '코딩이야기';

// 프론트엔드 (변경 후) - 백엔드 enum 값 사용
type BoardCategory = 'NOTICE' | 'CAREER' | 'CODING' | 'QNA';

// 백엔드 (BoardCategory enum)
// NOTICE, CAREER, CODING, QNA
```

---

## 5. 주요 변경 사항 요약

### ✅ 타입명 변경
- `BoardPost` → `Board`
- `UserProfile` → `Account`
- `BookmarkedCourse` → `CourseFavorite`

### ✅ 필드명 변경
- `content` → `text` (Board, Comment, AcademyQnA 등)
- `name` → `userName` (Account)
- `role` → `accountType` (Account)
- `company` → `affiliation` (Account)
- `department` → `position` (Account)
- `title` → `name` (Course)
- `institution` → `academy` (Course, 문자열 → 객체)
- `viewCount` → `hits` (Board)
- `board` → `category` (Community 관련)
- `isVerified` → `isApproved` (Academy)
- `parentId` → `topComment` (Comment, ID → 객체)

### ✅ 엔드포인트 변경
- `/api/board/posts` → `/api/boards`
- `/api/academy` → `/api/academies`
- `/api/course` → `/api/courses`
- `/api/auth/signup` → `/api/accounts`

### ✅ 유지 항목
- `AcademyQnA`, `CourseQnA`는 프론트엔드에서 통합 타입으로 유지
- `Academy`, `Course`, `Comment` 타입명 유지

---

## 6. 작업 순서

1. ✅ **매핑 문서 작성** (현재 문서)
2. ⬜ `types.ts` 파일 업데이트
3. ⬜ 서비스 파일 엔드포인트 통일
4. ⬜ 컴포넌트 및 페이지 변수명 업데이트
5. ⬜ Mock 데이터 필드명 업데이트
6. ⬜ 타입 에러 검증 및 테스트

---

**작성일:** 2025-11-05  
**작성자:** GitHub Copilot  
**참조:** `AGENTS.md`, 백엔드 엔티티 정의
