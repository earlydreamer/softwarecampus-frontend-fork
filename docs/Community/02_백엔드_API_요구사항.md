# 커뮤니티 백엔드 API 요구사항

## 1. API 엔드포인트 명세

### 1.1 게시글 (Board)

#### 게시글 목록 조회
```
GET /api/boards
```

**Query Parameters:**
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| category | string | N | NOTICE, QUESTION, COURSE_STORY, CODING_STORY |
| page | number | N | 페이지 번호 (기본값: 1) |
| limit | number | N | 페이지당 항목 수 (기본값: 20) |
| keyword | string | N | 검색 키워드 |
| searchType | string | N | all, title, content, title_content, author, comment |
| sortType | string | N | latest, popular, views, comments |

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "category": "QUESTION",
      "title": "게시글 제목",
      "secret": false,
      "userNickName": "작성자",
      "accountId": 1,
      "commentCount": 5,
      "hits": 100,        // 추가 요청
      "likeCount": 10,    // 추가 요청
      "createdAt": "2025-12-01T10:00:00"
    }
  ],
  "totalElements": 150,   // 추가 요청: 전체 게시글 수
  "totalPages": 8,        // 추가 요청: 전체 페이지 수
  "currentPage": 1
}
```

#### 게시글 상세 조회
```
GET /api/boards/{id}
```

**Response:** 현재 구현 완료 ✅

#### 게시글 작성
```
POST /api/boards
```

**Request Body:**
```json
{
  "title": "게시글 제목",
  "text": "<p>게시글 내용 (HTML)</p>",
  "category": "QUESTION",
  "isSecret": false
}
```

**Response:** 생성된 게시글 정보

#### 게시글 수정 ⚠️ 확인 필요
```
PATCH /api/boards/{id}
```

**Request Body:**
```json
{
  "title": "수정된 제목",
  "text": "<p>수정된 내용</p>",
  "category": "QUESTION",
  "isSecret": false
}
```

#### 게시글 삭제 ⚠️ 확인 필요
```
DELETE /api/boards/{id}
```

#### 게시글 추천
```
POST /api/boards/{id}/recommends
```

**Response:**
```json
{
  "success": true,
  "likeCount": 11
}
```

---

### 1.2 댓글 (Comment)

#### 댓글 작성
```
POST /api/boards/{boardId}/comments
```

**Request Body:**
```json
{
  "text": "댓글 내용"
}
```

#### 댓글 수정
```
PATCH /api/boards/{boardId}/comments/{commentId}
```

**Request Body:**
```json
{
  "text": "수정된 댓글 내용"
}
```

#### 댓글 삭제
```
DELETE /api/boards/{boardId}/comments/{commentId}
```

#### 대댓글 작성 ⚠️ 확인 필요
```
POST /api/boards/{boardId}/comments/{parentCommentId}/replies
```

---

### 1.3 파일 첨부 ⚠️ 확인 필요

#### 파일 업로드
```
POST /api/boards/upload
Content-Type: multipart/form-data
```

**Request:**
- `file`: 업로드할 파일
- `boardId`: 게시글 ID (선택)

**Response:**
```json
{
  "id": 1,
  "originalFileName": "document.pdf",
  "savedFile": "uuid-document.pdf",
  "downloadUrl": "/api/boards/files/1",
  "fileSize": 102400
}
```

---

## 2. 프론트엔드 요청사항

### 2.1 목록 조회 응답 개선
현재 목록 조회 시 부족한 필드:
- `hits` (조회수)
- `likeCount` (추천수)
- `totalElements` (전체 게시글 수)
- `totalPages` (전체 페이지 수)

### 2.2 정렬 기능 지원
`sortType` 파라미터 지원 필요:
- `latest`: 최신순 (createdAt DESC)
- `popular`: 추천순 (likeCount DESC)
- `views`: 조회순 (hits DESC)
- `comments`: 댓글순 (commentCount DESC)

### 2.3 검색 기능
`searchType` 파라미터 지원 필요:
- `all`: 제목 + 내용 + 작성자
- `title`: 제목만
- `content`: 내용만
- `title_content`: 제목 + 내용
- `author`: 작성자명
- `comment`: 댓글 내용

### 2.4 권한 처리
- 게시글 수정/삭제: 작성자 본인 또는 관리자만 가능
- 비밀글 조회: 작성자 본인 또는 관리자만 가능
- 공지사항 작성: 관리자만 가능

---

## 3. 에러 응답 형식

```json
{
  "timestamp": "2025-12-01T10:00:00",
  "status": 400,
  "errorCode": "BOARD_NOT_FOUND",
  "message": "게시글을 찾을 수 없습니다.",
  "path": "/api/boards/999"
}
```

### 에러 코드 목록
| errorCode | HTTP Status | 설명 |
|-----------|-------------|------|
| `BOARD_NOT_FOUND` | 404 | 게시글 없음 |
| `COMMENT_NOT_FOUND` | 404 | 댓글 없음 |
| `UNAUTHORIZED` | 401 | 로그인 필요 |
| `FORBIDDEN` | 403 | 권한 없음 |
| `INVALID_CATEGORY` | 400 | 잘못된 카테고리 |
| `TITLE_TOO_LONG` | 400 | 제목 길이 초과 |
| `CONTENT_TOO_SHORT` | 400 | 내용 길이 부족 |
| `ALREADY_RECOMMENDED` | 400 | 이미 추천함 |
| `FILE_TOO_LARGE` | 400 | 파일 크기 초과 |
| `INVALID_FILE_TYPE` | 400 | 허용되지 않는 파일 형식 |
