# 커뮤니티 API 연동 중간 보고서 - 프론트엔드

> **브랜치**: `Community-Integration`  
> **작성일**: 2025년 12월 2일  
> **상태**: 진행 중

---

## 📋 개요

커뮤니티(게시판) 기능의 프론트엔드-백엔드 API 연동 작업을 진행하며 발견한 문제점과 수정 사항을 정리합니다.

---

## 🐛 발견된 문제점 및 해결

### 1. 개발환경 테스트 계정이 실제 API를 우회하는 문제

**증상**: 로그인 시 항상 "시스템 관리자"(id=1)로 로그인되어 게시글/댓글이 해당 계정으로 작성됨

**원인**: `authStore.ts`에 하드코딩된 관리자 테스트 계정이 실제 API 호출보다 먼저 처리됨

**수정 파일**: `src/store/authStore.ts`

#### 수정 내용

```typescript
// 삭제된 코드
const ADMIN_TEST_ACCOUNT = import.meta.env.DEV ? {
  user: {
    id: 1,
    email: 'admin@test.com',
    userName: '관리자',
    // ... 기타 필드
  },
  password: 'test'
} : null;

// login 함수 내부 - 삭제된 부분
if (import.meta.env.DEV && ADMIN_TEST_ACCOUNT && 
    email === ADMIN_TEST_ACCOUNT.user.email && 
    password === ADMIN_TEST_ACCOUNT.password) {
  set({
    user: ADMIN_TEST_ACCOUNT.user,
    accessToken: 'admin-test-token',
    // ...
  });
  return true;
}
```

**수정 후**: 모든 로그인 요청이 백엔드 API(`/api/auth/login`)를 통해 처리됨

---

### 2. 게시글 목록에서 조회수/추천수가 0으로 표시되는 문제

**증상**: 게시글 목록에서 조회수와 추천수가 항상 0으로 표시됨

**원인**: 
1. `ApiBoardListResponse` 타입에 `hits`, `likeCount` 필드 누락
2. `communityService.ts` 매핑에서 해당 값을 0으로 하드코딩

#### 수정 파일 1: `src/services/api/types.ts`

```typescript
// 수정 전
export interface ApiBoardListResponse {
    id: number;
    category: string;
    title: string;
    secret: boolean;
    userNickName: string;
    accountId: number;
    commentsCount: number;
    createdAt: string;
}

// 수정 후
export interface ApiBoardListResponse {
    id: number;
    category: string;
    title: string;
    secret: boolean;
    userNickName: string;
    accountId: number;
    commentsCount: number;
    hits: number;           // 추가: 조회수
    likeCount: number;      // 추가: 추천수
    createdAt: string;
}
```

#### 수정 파일 2: `src/services/communityService.ts`

```typescript
// 수정 전 - fetchBoardPosts 내 매핑
const posts = response.data.content.map(dto => ({
    // ...
    hits: 0,        // 하드코딩!
    likeCount: 0,   // 하드코딩!
    // ...
}));

// 수정 후
const posts = response.data.content.map(dto => ({
    // ...
    hits: dto.hits ?? 0,           // 실제 값 사용
    likeCount: dto.likeCount ?? 0, // 실제 값 사용
    // ...
}));
```

---

## 📂 수정된 파일 요약

| 파일 | 수정 내용 |
|------|----------|
| `store/authStore.ts` | 하드코딩된 관리자 테스트 계정 제거 |
| `services/api/types.ts` | `ApiBoardListResponse`에 `hits`, `likeCount` 필드 추가 |
| `services/communityService.ts` | 목록 매핑에서 실제 API 값 사용 |

---

## 🔧 API 연동 관련 주요 매핑 정보

### 백엔드-프론트엔드 필드명 매핑

| 백엔드 (Java) | 프론트엔드 (TypeScript) | 설명 |
|---------------|------------------------|------|
| `userNickName` | `account.userName` | 작성자 이름 |
| `accountId` | `account.id` | 작성자 ID |
| `commentsCount` | `commentCount` | 댓글 수 |
| `secret` | `secret` / `isSecret` | 비밀글 여부 |
| `hits` | `hits` | 조회수 |
| `likeCount` | `likeCount` | 추천수 |

### API 파라미터 매핑

| 프론트엔드 파라미터 | 백엔드 파라미터 | 설명 |
|--------------------|----------------|------|
| `page` | `pageNo` | 페이지 번호 (1-based) |
| `keyword` | `searchText` | 검색어 |
| `searchType` | `searchType` | 검색 타입 |

---

## 📝 타입 정의 현황

### Board 인터페이스 (`src/types/index.ts`)

```typescript
interface Board {
    id: number;
    title: string;
    text: string;
    category: BoardCategory;
    account: {
        id: number;
        userName: string;
        avatar?: string;
    };
    hits: number;
    secret: boolean;
    createdAt: string;
    updatedAt?: string;
    likeCount: number;
    like?: boolean;
    owner?: boolean;
    commentCount?: number;
    hasAttachment?: boolean;
    isSecret?: boolean;
    comments?: Comment[];
}
```

### ApiBoardListResponse (백엔드 DTO 매핑)

```typescript
interface ApiBoardListResponse {
    id: number;
    category: string;
    title: string;
    secret: boolean;
    userNickName: string;
    accountId: number;
    commentsCount: number;
    hits: number;
    likeCount: number;
    createdAt: string;
}
```

---

## ✅ 테스트 결과

- [x] 실제 계정으로 로그인 성공
- [x] 게시글 작성 시 실제 사용자 이름 표시
- [x] 댓글 작성 시 실제 사용자 이름 표시
- [x] 게시글 목록에서 조회수 정상 표시
- [x] 게시글 목록에서 추천수 정상 표시

---

## ⚠️ 주의사항

### 개발환경 테스트 계정 사용 시
- `authStore.ts`에서 하드코딩된 테스트 계정 제거됨
- 개발 테스트 시에도 실제 백엔드 API를 통한 로그인 필요
- 테스트 계정이 필요한 경우 DB에 직접 생성

### API 응답 타입 변경 시
- `types.ts`의 인터페이스 수정
- `communityService.ts`의 매핑 함수 확인
- TypeScript 컴파일 에러 확인

---

## 🔜 후속 작업

1. 토큰 갱신 로직 안정화 테스트
2. 에러 핸들링 개선 (네트워크 에러, 401 에러 등)
3. 게시글 수정/삭제 기능 테스트
4. 첨부파일 업로드/다운로드 테스트

---

## 📌 참고: 서비스 구조

```
src/services/
├── api/
│   ├── client.ts          # Axios 인스턴스 (인터셉터, 토큰 갱신)
│   └── types.ts           # 백엔드 API 응답 타입 정의
└── communityService.ts    # 커뮤니티 API 호출 및 매핑
```

### API 클라이언트 설정 (`client.ts`)
- 베이스 URL: `/api` (Vite 프록시 → `localhost:8082`)
- 요청 인터셉터: Authorization 헤더에 accessToken 추가
- 응답 인터셉터: 401 에러 시 토큰 갱신 시도
