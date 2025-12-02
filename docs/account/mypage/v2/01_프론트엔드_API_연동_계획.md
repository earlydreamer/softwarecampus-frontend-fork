# 마이페이지 활동 내역 - 프론트엔드 API 연동 계획

## 📅 작업 정보
- **작성일**: 2025년 12월 2일
- **브랜치**: `mypage-community-update`
- **의존성**: 백엔드 API 구현 완료 ✅

---

## 📋 현재 상태 분석

### 현재 구조
```
src/pages/MyPage/
├── MyPage.tsx          # 메인 페이지
├── useMyPage.ts        # 커스텀 훅 (상태 관리)
├── data.ts             # ⚠️ Mock 데이터 (제거 대상)
├── index.tsx           # export
└── components/
    ├── OverviewTab.tsx
    ├── PostsTab.tsx    # ⚠️ Mock 데이터 사용 중
    ├── CommentsTab.tsx # ⚠️ Mock 데이터 사용 중
    ├── BookmarksTab.tsx # ⚠️ Mock 데이터 사용 중
    ├── Sidebar.tsx
    └── modals/
```

### 문제점
| 파일 | 현재 상태 | 문제 |
|------|-----------|------|
| `data.ts` | Mock 데이터 export | 실제 API 연동 필요 |
| `useMyPage.ts` | Mock 데이터 import | API 호출로 교체 필요 |
| `PostsTab.tsx` | `myPosts` 직접 import | props로 받도록 변경 필요 |
| `CommentsTab.tsx` | `myComments` 직접 import | props로 받도록 변경 필요 |
| `BookmarksTab.tsx` | `bookmarkedCourses` 직접 import | props로 받도록 변경 필요 |

---

## 🎯 연동할 백엔드 API

| API Endpoint | Method | 설명 | 프론트 사용처 |
|--------------|--------|------|---------------|
| `/api/mypage/posts` | GET | 내가 쓴 글 목록 | PostsTab |
| `/api/mypage/comments` | GET | 내가 쓴 댓글 목록 | CommentsTab |
| `/api/mypage/stats` | GET | 활동 통계 | Sidebar, OverviewTab |
| `/api/courses/favorites` | GET | 찜한 강좌 목록 | BookmarksTab |

---

## 📁 수정 대상 파일

### 1. `src/services/mypageService.ts` - API 함수 추가

**추가할 함수:**
```typescript
// 내가 쓴 글 목록
export const getMyPosts = async (page = 0, size = 10): Promise<PageResponse<MyPost>> => {
    const response = await apiClient.get(`/api/mypage/posts?page=${page}&size=${size}`);
    return response.data;
};

// 내가 쓴 댓글 목록
export const getMyComments = async (page = 0, size = 10): Promise<PageResponse<MyComment>> => {
    const response = await apiClient.get(`/api/mypage/comments?page=${page}&size=${size}`);
    return response.data;
};

// 활동 통계
export const getMyStats = async (): Promise<MyStats> => {
    const response = await apiClient.get('/api/mypage/stats');
    return response.data;
};

// 찜한 강좌 목록 (기존 API 활용)
export const getFavorites = async (): Promise<CourseFavorite[]> => {
    const response = await apiClient.get('/api/courses/favorites');
    return response.data;
};
```

### 2. `src/types/mypage.ts` - 타입 정의 (신규)

```typescript
// 페이지네이션 응답
export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

// 내가 쓴 글
export interface MyPost {
    id: number;
    title: string;
    category: string;
    hits: number;
    commentsCount: number;
    likeCount: number;
    createdAt: string;
}

// 내가 쓴 댓글
export interface MyComment {
    id: number;
    text: string;
    boardId: number;
    boardTitle: string;
    createdAt: string;
}

// 활동 통계
export interface MyStats {
    totalPosts: number;
    totalComments: number;
    totalBookmarks: number;
    totalViews: number;
}
```

### 3. `src/pages/MyPage/useMyPage.ts` - API 연동

**변경 사항:**
- Mock 데이터 import 제거
- useQuery 훅 추가하여 API 호출
- 로딩/에러 상태 관리

```typescript
// Before
import { myPosts, myComments, bookmarkedCourses } from './data';

// After
import { useQuery } from '@tanstack/react-query';
import { getMyPosts, getMyComments, getMyStats, getFavorites } from '../../services/mypageService';
```

### 4. 각 Tab 컴포넌트 - Props 방식으로 변경

| 컴포넌트 | 현재 | 변경 후 |
|----------|------|---------|
| PostsTab | `data.ts`에서 직접 import | `useMyPage`에서 props로 전달 |
| CommentsTab | `data.ts`에서 직접 import | `useMyPage`에서 props로 전달 |
| BookmarksTab | `data.ts`에서 직접 import | `useMyPage`에서 props로 전달 |

---

## 🔄 구현 순서

### Phase 1: 타입 정의 및 API 함수 추가
1. `src/types/mypage.ts` 생성 - 타입 정의
2. `src/services/mypageService.ts` 수정 - API 함수 4개 추가

### Phase 2: useMyPage 훅 수정
1. Mock 데이터 import 제거
2. useQuery 훅으로 API 호출 추가
3. 로딩/에러 상태 추가
4. 데이터를 컴포넌트에 전달하도록 return 수정

### Phase 3: Tab 컴포넌트 수정
1. PostsTab - props로 데이터 받기, 페이지네이션 추가
2. CommentsTab - props로 데이터 받기, 페이지네이션 추가
3. BookmarksTab - props로 데이터 받기

### Phase 4: 정리
1. `data.ts`에서 Mock 데이터 제거 (helper 함수만 유지)
2. 테스트 및 검증

---

## 📊 예상 작업 시간

| 단계 | 작업 내용 | 예상 시간 |
|------|-----------|-----------|
| Phase 1 | 타입 정의 + API 함수 | 30분 |
| Phase 2 | useMyPage 훅 수정 | 1시간 |
| Phase 3 | Tab 컴포넌트 수정 | 1시간 30분 |
| Phase 4 | 정리 및 테스트 | 30분 |
| **합계** | | **3시간 30분** |

---

## ⚠️ 주의사항

1. **인증 토큰**: 모든 API는 JWT 토큰이 필요
2. **페이지네이션**: 글/댓글 목록은 무한 스크롤 또는 페이지네이션 UI 필요
3. **에러 처리**: 401 (인증 실패), 500 (서버 에러) 처리 필요
4. **로딩 상태**: 스켈레톤 UI 또는 로딩 스피너 적용

---

## 🔗 관련 문서

- **백엔드 구현 완료 보고**: `softwarecampus-backend/.md/account/프로젝트 작업 지침/update/mypage-v2/03_구현_완료_정리.md`
- **v1 문서**: `docs/account/mypage/v1/`
