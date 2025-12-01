# 커뮤니티 백엔드 API 검증 결과

> **📅 검증일:** 2024-12-01
> **📅 수정일:** 2025-12-02
> **📍 검증 대상:** `BoardController.java` 및 관련 DTO
> **✅ 수정 상태:** 프론트엔드 API 불일치 수정 완료

---

## 🎯 수정 완료 요약

| 항목 | 상태 | 수정 파일 |
|------|------|----------|
| 목록 조회 파라미터 (page→pageNo, keyword→searchText) | ✅ 완료 | `communityService.ts` |
| 목록 응답 타입 (SpringPage 구조) | ✅ 완료 | `types.ts`, `communityService.ts` |
| 댓글 수 필드명 (commentCount→commentsCount) | ✅ 완료 | `types.ts` |
| 게시글 작성 (JSON→FormData, isSecret→secret) | ✅ 완료 | `communityService.ts` |
| 누락 API 추가 (수정/삭제/추천취소/첨부파일 등) | ✅ 완료 | `communityService.ts` |
| CommunityPage totalPages 사용 | ✅ 완료 | `CommunityPage.tsx` |

---

## 1. 백엔드 API 현황 (실제 구현)

### ✅ 구현된 API 목록

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/boards` | 게시글 목록 조회 (검색 포함) |
| GET | `/api/boards/{boardId}` | 게시글 상세 조회 |
| POST | `/api/boards` | 게시글 생성 (첨부파일 포함) |
| PATCH | `/api/boards/{boardId}` | 게시글 수정 (첨부파일 포함) |
| DELETE | `/api/boards/{boardId}` | 게시글 삭제 |
| GET | `/api/boards/{boardId}/boardAttachs/{boardAttachId}/download` | 첨부파일 다운로드 |
| POST | `/api/boards/{boardId}/recommends` | 게시글 추천 |
| DELETE | `/api/boards/{boardId}/recommends` | 게시글 추천 취소 |
| POST | `/api/boards/{boardId}/comments` | 댓글 생성 |
| PATCH | `/api/boards/{boardId}/comments/{commentId}` | 댓글 수정 |
| DELETE | `/api/boards/{boardId}/comments/{commentId}` | 댓글 삭제 |
| POST | `/api/boards/{boardId}/comments/{commentId}/recommends` | 댓글 추천 |
| DELETE | `/api/boards/{boardId}/comments/{commentId}/recommends` | 댓글 추천 취소 |

---

## 2. 파라미터/필드 불일치 상세

### 2.1 게시글 목록 조회 API

**백엔드 실제 파라미터 (`BoardController.java` 34행):**
```java
@GetMapping
public ResponseEntity<?> getBoards(
    @RequestParam(defaultValue = "1") int pageNo,   // ⚠️ page가 아닌 pageNo
    BoardCategory category, 
    @RequestParam(required = false) String searchType, 
    @RequestParam(required = false) String searchText  // ⚠️ keyword가 아닌 searchText
)
```

| 항목 | 프론트엔드 | 백엔드 | 상태 |
|------|-----------|--------|------|
| 페이지 번호 | ~~`page`~~ → `pageNo` | `pageNo` | ✅ 수정완료 |
| 검색어 | ~~`keyword`~~ → `searchText` | `searchText` | ✅ 수정완료 |
| 페이지 크기 | `limit` | ❌ 없음 | 🟡 백엔드 미지원 (무시) |
| 정렬 | `sortType` | ❌ 없음 | 🟣 백엔드 미지원 |

### 2.2 게시글 목록 응답 DTO

**백엔드 (`BoardListResponseDTO.java`):**
```java
private Long id;
private BoardCategory category;
private String title;
private Boolean secret;
private String userNickName;
private Long accountId;
private Long commentsCount;  // ⚠️ commentCount가 아닌 commentsCount
private LocalDateTime createdAt;
// hits, likeCount 필드 없음!
```

**프론트엔드 타입 (`types.ts`) - ✅ 수정완료:**
```typescript
interface ApiBoardListResponse {
  id: number;
  category: string;
  title: string;
  secret: boolean;
  userNickName: string;
  accountId: number;
  commentsCount: number;  // ✅ 백엔드와 일치
  createdAt: string;
}
```

| 필드 | 프론트엔드 | 백엔드 | 상태 |
|------|-----------|--------|------|
| 댓글 수 | ~~`commentCount`~~ → `commentsCount` | `commentsCount` | ✅ 수정완료 |
| 조회수 | `hits` | ❌ 없음 | 🟡 목록에서 미제공 |
| 추천수 | `likeCount` | ❌ 없음 | 🟡 목록에서 미제공 |

### 2.3 게시글 작성 요청

**백엔드 (`BoardCreateRequestDTO.java`):**
```java
private BoardCategory category;  // @NotNull
private String title;            // @NotBlank
private String text;             // @NotBlank
private boolean secret;          // ⚠️ isSecret이 아닌 secret
```

**백엔드 컨트롤러:**
```java
@PostMapping
public ResponseEntity<?> createBoard(
    @Valid BoardCreateRequestDTO boardCreateRequestDTO, 
    @RequestParam(required = false) MultipartFile[] files,  // ⚠️ multipart/form-data 필요
    @AuthenticationPrincipal CustomUserDetails userDetails
)
```

| 항목 | 프론트엔드 | 백엔드 | 상태 |
|------|-----------|--------|------|
| 비밀글 필드 | ~~`isSecret`~~ → `secret` | `secret` | ✅ 수정완료 |
| 전송 방식 | ~~JSON Body~~ → FormData | multipart/form-data | ✅ 수정완료 |
| 파일 업로드 | `files` 파라미터 | 동일 API (files 파라미터) | ✅ 수정완료 |

### 2.4 게시글 수정 요청

**백엔드 (`BoardUpdateRequestDTO.java`):**
```java
private Long id;           // @NotNull - 게시글 ID 필수
private String title;
private String text;
private boolean secret;
```

**권한 체크:**
```java
@PreAuthorize("hasRole('ROLE_ADMIN') or @boardAuthorizeService.canManipulateBoard(#boardId,principal.id)")
```

### 2.5 댓글 작성 요청

**백엔드 (`CommentCreateRequestDTO.java`):**
```java
private Long boardId;        // @NotNull - 컨트롤러에서 설정
private Long topCommentId;   // 대댓글용 상위 댓글 ID
private String text;         // @NotBlank
```

| 항목 | 프론트엔드 | 백엔드 | 상태 |
|------|-----------|--------|------|
| 대댓글 | ❌ 미구현 | `topCommentId` 지원 | 🟡 프론트 확장 필요 |

---

## 3. 응답 구조 분석

### 3.1 페이지네이션 응답

백엔드는 **Spring Data `Page<T>`** 객체를 반환합니다.

**실제 응답 구조:**
```json
{
  "content": [...],           // 게시글 배열
  "pageable": {...},          // 페이징 정보
  "totalElements": 150,       // 전체 항목 수
  "totalPages": 8,            // 전체 페이지 수
  "size": 20,                 // 페이지 크기
  "number": 0,                // 현재 페이지 (0-indexed!)
  "sort": {...},
  "first": true,
  "last": false,
  "numberOfElements": 20,
  "empty": false
}
```

**⚠️ 주의:** `number`는 **0-indexed** (백엔드 `pageNo`는 1부터 시작하지만 응답의 `number`는 0부터)

### 3.2 에러 응답 (ProblemDetail)

**백엔드 (`BoardController.java` 140행):**
```java
@ExceptionHandler(BoardException.class)
public ProblemDetail handleBoardException(BoardException e, HttpServletRequest request) {
    ProblemDetail problemDetail = ProblemDetail.forStatus(e.getErrorCode().getHttpStatus());
    problemDetail.setTitle(e.getErrorCode().toString());
    problemDetail.setDetail(e.getErrorCode().getDetails());
    problemDetail.setProperty("timestamp", ...);
    problemDetail.setInstance(URI.create(request.getRequestURI()));
    return problemDetail;
}
```

**응답 구조 (RFC 7807):**
```json
{
  "type": "about:blank",
  "title": "BOARD_NOT_FOUND",
  "status": 404,
  "detail": "게시글을 찾을 수 없습니다",
  "instance": "/api/boards/999",
  "timestamp": "2024-12-01 10:00:00"
}
```

---

## 4. 프론트엔드 수정 작업 목록

### 4.1 필수 수정 (🔴) - ✅ 모두 완료

#### A. `communityService.ts` - fetchBoardPosts 파라미터 수정 ✅
```typescript
// 수정 완료된 코드
const params: Record<string, any> = { pageNo: page };
if (category) params.category = category;
if (searchKeyword) params.searchText = searchKeyword;  // keyword → searchText
if (searchType) params.searchType = searchType;
// limit 제거 (백엔드 미지원)
```

#### B. `communityService.ts` - fetchBoardPosts 응답 처리 ✅
```typescript
// 수정 완료된 코드
interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
const response = await apiClient.get<SpringPage<ApiBoardListResponse>>('/api/boards', { params });
return { 
  posts: response.data.content.map(...),
  total: response.data.totalElements,
  totalPages: response.data.totalPages 
};
```

#### C. `types.ts` - ApiBoardListResponse 필드명 수정 ✅
```typescript
// 수정 완료된 코드
commentsCount: number;  // commentCount → commentsCount
```

#### D. `communityService.ts` - createBoardPost FormData 사용 ✅
```typescript
// 수정 완료된 코드
const formData = new FormData();
formData.append('title', data.title);
formData.append('text', data.text);
formData.append('category', data.category);
formData.append('secret', String(data.isSecret));  // isSecret → secret
if (files) {
  files.forEach(file => formData.append('files', file));
}
await apiClient.post('/api/boards', formData);
```

#### E. 누락된 API 함수 추가 ✅
```typescript
// 모두 구현 완료
✅ updateBoardPost      - 게시글 수정
✅ deleteBoardPost      - 게시글 삭제
✅ cancelRecommendBoardPost - 추천 취소
✅ downloadBoardAttachment  - 첨부파일 다운로드
✅ recommendComment     - 댓글 추천
✅ cancelRecommendComment - 댓글 추천 취소
```

### 4.2 권장 수정 (🟡)

#### A. 대댓글 지원
```typescript
// createComment 함수 확장
export const createComment = async (
  postId: number, 
  text: string, 
  topCommentId?: number  // 대댓글용
): Promise<Comment> => {
  const body: any = { text };
  if (topCommentId) body.topCommentId = topCommentId;
  const response = await apiClient.post(`/api/boards/${postId}/comments`, body);
  return mapDtoToComment(response.data);
};
```

### 4.3 백엔드 요청 사항 (🟣)

1. **sortType 파라미터 지원** - 목록 정렬 기능
2. **목록 응답에 hits, likeCount 추가** - UI 표시용

---

## 5. 카테고리 매핑

**백엔드 `BoardCategory` enum:**
```java
NOTICE,           // 공지사항
QUESTION,         // 문의사항
COURSE_STORY,     // 진로이야기
CODING_STORY      // 코딩이야기
```

**프론트엔드 매핑:**
```typescript
type BoardCategory = 'NOTICE' | 'QUESTION' | 'COURSE_STORY' | 'CODING_STORY';

const CATEGORY_LABELS: Record<BoardCategory, string> = {
  NOTICE: '공지사항',
  QUESTION: '문의사항',
  COURSE_STORY: '진로이야기',
  CODING_STORY: '코딩이야기',
};
```

---

## 6. 체크리스트 요약

| 기능 | 프론트엔드 | 백엔드 | 상태 | 우선순위 |
|------|-----------|--------|------|---------|
| 목록 조회 파라미터 | ~~page, keyword~~ → pageNo, searchText | pageNo, searchText | ✅ 완료 | - |
| 목록 응답 필드 | ~~commentCount~~ → commentsCount | commentsCount | ✅ 완료 | - |
| 목록 페이지네이션 | SpringPage 구조 사용 | Page 객체 | ✅ 완료 | - |
| 게시글 작성 | FormData, secret | FormData, secret | ✅ 완료 | - |
| 게시글 수정 | ✅ 구현됨 | ✅ 구현됨 | ✅ 완료 | - |
| 게시글 삭제 | ✅ 구현됨 | ✅ 구현됨 | ✅ 완료 | - |
| 추천 취소 | ✅ 구현됨 | ✅ 구현됨 | ✅ 완료 | - |
| 첨부파일 다운로드 | ✅ 구현됨 | ✅ 구현됨 | ✅ 완료 | - |
| 대댓글 | ❌ 미구현 | ✅ 구현됨 | 🟡 | 낮음 |
| 댓글 추천 | ✅ 구현됨 | ✅ 구현됨 | ✅ 완료 | - |
| 정렬 기능 | sortType 전송 | ❌ 미지원 | 🟣 백엔드 요청 | - |

---

## 7. 남은 작업 (TODO)

### 🟡 권장 수정 (낮은 우선순위)

#### A. 대댓글 지원
```typescript
// createComment 함수 확장 필요
export const createComment = async (
  postId: number, 
  text: string, 
  topCommentId?: number  // 대댓글용
): Promise<Comment> => {
  const body: any = { text };
  if (topCommentId) body.topCommentId = topCommentId;
  const response = await apiClient.post(`/api/boards/${postId}/comments`, body);
  return mapDtoToComment(response.data);
};
```

### 🟣 백엔드 요청 사항

1. **sortType 파라미터 지원** - 목록 정렬 기능 (최신순/추천순/조회순/댓글순)
2. **목록 응답에 hits, likeCount 추가** - UI 표시용
