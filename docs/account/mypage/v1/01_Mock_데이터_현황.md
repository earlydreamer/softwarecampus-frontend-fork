# Mock 데이터 상세 현황

**파일**: `src/pages/MyPage.tsx`  
**업데이트**: 2025-11-29

---

## 📦 Mock 데이터 목록

### 1️⃣ 작성한 글 (myPosts)

**위치**: Line 27-31

```typescript
const myPosts = [
    { 
        id: 1, 
        title: 'React 19 새로운 기능 정리', 
        category: 'CODING_STORY', 
        createdAt: '2024-01-15', 
        views: 245, 
        comments: 12 
    },
    { 
        id: 2, 
        title: 'TypeScript 5.0 마이그레이션 후기', 
        category: 'COURSE_STORY', 
        createdAt: '2024-01-10', 
        views: 189, 
        comments: 8 
    },
    { 
        id: 3, 
        title: 'Vite vs Webpack 성능 비교', 
        category: 'CODING_STORY', 
        createdAt: '2024-01-05', 
        views: 312, 
        comments: 15 
    }
];
```

**사용 위치:**
- Line 51: `totalViews` 계산
- Line 52: `totalComments` 계산
- Line 238: KPI 카드 (작성한 글 수)
- Line 258: KPI 카드 (총 댓글 수)
- Line 278: KPI 카드 (총 조회수)
- Line 296: 최근 게시글 섹션 (slice(0, 3))
- Line 406: 글 탭 - 전체 글 수 통계
- Line 410: 글 탭 - 총 조회수 통계
- Line 414: 글 탭 - 총 댓글수 통계
- Line 426: 글 탭 - 글 목록 렌더링
- Line 625: 탭 메뉴 - 글 카운트 표시

**필요한 백엔드 API:**
```
GET /api/mypage/posts?page=1&size=10&sort=createdAt,desc
```

**필요한 응답 필드:**
```typescript
interface MyPost {
    id: number;
    title: string;
    category: BoardCategory; // CODING_STORY, COURSE_STORY, etc.
    createdAt: string;
    views: number;
    comments: number;
}

interface MyPostsResponse {
    content: MyPost[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
}
```

---

### 2️⃣ 작성한 댓글 (myComments)

**위치**: Line 33-37

```typescript
const myComments = [
    { 
        id: 1, 
        postTitle: 'Next.js 14 App Router 사용기', 
        content: '저도 비슷한 경험이 있어서 공감되네요!', 
        createdAt: '2024-01-14' 
    },
    { 
        id: 2, 
        postTitle: 'TailwindCSS 유용한 팁', 
        content: '이 방법 정말 좋네요. 감사합니다!', 
        createdAt: '2024-01-12' 
    },
    { 
        id: 3, 
        postTitle: 'Docker 입문 가이드', 
        content: '초보자에게 정말 도움이 되는 글이네요', 
        createdAt: '2024-01-08' 
    }
];
```

**사용 위치:**
- Line 338: 최근 댓글 섹션 (slice(0, 3))
- Line 467: 댓글 탭 - 작성한 댓글 수 통계
- Line 483: 댓글 탭 - 댓글 목록 렌더링
- Line 626: 탭 메뉴 - 댓글 카운트 표시

**필요한 백엔드 API:**
```
GET /api/mypage/comments?page=1&size=10&sort=createdAt,desc
```

**필요한 응답 필드:**
```typescript
interface MyComment {
    id: number;
    postTitle: string;
    postId: number; // 게시글 이동용
    content: string;
    createdAt: string;
}

interface MyCommentsResponse {
    content: MyComment[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
}
```

---

### 3️⃣ 찜한 과정 (bookmarkedCourses)

**위치**: Line 39-43

```typescript
const bookmarkedCourses = [
    { 
        id: 1, 
        title: 'React 완벽 마스터', 
        academy: '코딩마스터', 
        category: '프론트엔드', 
        rating: 4.8 
    },
    { 
        id: 2, 
        title: 'TypeScript 실전 프로젝트', 
        academy: '소프트웨어 아카데미', 
        category: '프론트엔드', 
        rating: 4.9 
    },
    { 
        id: 3, 
        title: 'Node.js 백엔드 개발', 
        academy: '데이터 인사이트', 
        category: '백엔드', 
        rating: 4.7 
    }
];
```

**사용 위치:**
- Line 268: KPI 카드 (찜한 과정 수)
- Line 377: 찜한 과정 섹션 (slice(0, 2))
- Line 517: 찜 탭 - 찜한 과정 수 통계
- Line 521: 찜 탭 - 평균 평점 계산
- Line 537: 찜 탭 - 과정 목록 렌더링
- Line 627: 탭 메뉴 - 찜 카운트 표시

**필요한 백엔드 API:**
```
GET /api/mypage/bookmarks?page=1&size=10
```

**필요한 응답 필드:**
```typescript
interface BookmarkedCourse {
    id: number;
    title: string;
    academy: string;
    category: string; // 또는 CategoryType
    rating: number;
}

interface BookmarksResponse {
    content: BookmarkedCourse[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
}
```

---

### 4️⃣ 최근 활동 (recentActivity)

**위치**: Line 45-49

```typescript
const recentActivity = [
    { 
        type: 'post', 
        title: 'React 19 새로운 기능 정리', 
        date: '2024-01-15' 
    },
    { 
        type: 'comment', 
        title: 'Next.js 14 App Router 사용기에 댓글', 
        date: '2024-01-14' 
    },
    { 
        type: 'bookmark', 
        title: 'TypeScript 실전 프로젝트를 찜함', 
        date: '2024-01-13' 
    }
];
```

**사용 위치:**
- Line 169: 사이드바 "최근 활동" 카드

**필요한 백엔드 API:**
```
GET /api/mypage/activities?limit=10
```

**필요한 응답 필드:**
```typescript
type ActivityType = 'post' | 'comment' | 'bookmark';

interface Activity {
    type: ActivityType;
    title: string;
    date: string; // ISO 8601 또는 yyyy-MM-dd
    relatedId?: number; // 게시글/댓글/과정 ID (링크용)
}

interface ActivitiesResponse {
    activities: Activity[];
}
```

---

### 5️⃣ 하드코딩된 통계 데이터

#### 이번 달 댓글 수

**위치**: Line 508

```typescript
<p className="text-2xl font-bold text-purple-600 dark:text-purple-400">2</p>
```

**필요한 백엔드 API:**
```
GET /api/mypage/statistics
```

**필요한 응답 필드:**
```typescript
interface Statistics {
    totalPosts: number;
    totalComments: number;
    totalViews: number;
    totalBookmarks: number;
    commentsThisMonth: number; // 하드코딩 2 대체
    postsThisMonth?: number;
    viewsThisMonth?: number;
}
```

---

## 🔄 **실제 데이터 (authStore)**

**출처**: `useAuthStore()` - Line 13

### 사용되는 필드

```typescript
const { user, isAuthenticated } = useAuthStore();

// user 객체 필드 (Account 타입)
user.userName       // 사용자명 (Line 110, 118, 626)
user.email          // 이메일 (Line 132)
user.phoneNumber    // 전화번호 (Line 136)
user.accountType    // 계정 타입 (Line 113-117)
user.accountApproved // 승인 상태 (Line 140)
user.affiliation    // 소속 (Line 144-149, 조건부)
user.position       // 직책 (Line 150-155, 조건부)
user.address        // 주소 (Line 156-161, 조건부)
```

### 데이터 출처
- 로그인 시 authStore에 저장된 데이터
- 페이지 새로고침 시 localStorage에서 복원 (zustand/persist)
- ⚠️ **최신 프로필 정보 아님** (서버 조회 필요)

---

## 📊 **데이터 사용 매핑**

### KPI 카드 (개요 탭)
| 카드 | 데이터 출처 | Mock 여부 |
|------|-----------|----------|
| 작성한 글 | `myPosts.length` | 🟡 Mock |
| 총 댓글 | `totalComments` (myPosts 합산) | 🟡 Mock |
| 찜한 과정 | `bookmarkedCourses.length` | 🟡 Mock |
| 총 조회수 | `totalViews` (myPosts 합산) | 🟡 Mock |

### 사이드바 카드
| 카드 | 데이터 출처 | Mock 여부 |
|------|-----------|----------|
| 프로필 정보 | `authStore.user` | ✅ 실제 (로그인 시점) |
| 최근 활동 | `recentActivity` | 🟡 Mock |
| 활동 요약 | `myPosts`, `totalComments`, `totalViews` | 🟡 Mock |

### 탭 콘텐츠
| 탭 | 데이터 출처 | Mock 여부 |
|-----|-----------|----------|
| 개요 | 모든 Mock 데이터 | 🟡 Mock |
| 글 | `myPosts` | 🟡 Mock |
| 댓글 | `myComments` | 🟡 Mock |
| 찜 | `bookmarkedCourses` | 🟡 Mock |

---

## 🎯 **API 개발 우선순위**

### 필수 (활동 탭 동작에 필요)
1. `GET /api/mypage/posts` - 작성한 글 목록
2. `GET /api/mypage/comments` - 작성한 댓글 목록
3. `GET /api/mypage/bookmarks` - 찜한 과정 목록

### 권장 (UX 개선)
4. `GET /api/mypage/statistics` - 통계 데이터
5. `GET /api/mypage/activities` - 최근 활동 로그

---

## 💡 **구현 전략**

### 단계별 접근

**1단계: 프로필 관리 기능 (백엔드 API 있음)**
- ✅ GET /api/mypage/profile
- ✅ PATCH /api/mypage/profile
- ✅ DELETE /api/mypage/account

**2단계: 활동 데이터 (백엔드 API 필요)**
- ❌ GET /api/mypage/posts
- ❌ GET /api/mypage/comments
- ❌ GET /api/mypage/bookmarks
- ❌ GET /api/mypage/statistics
- ❌ GET /api/mypage/activities

**3단계: Mock 데이터 대체**
- TanStack Query로 데이터 페칭
- 로딩/에러 상태 처리
- 페이지네이션 구현
- 무한 스크롤 (선택)

---

## 🔗 **관련 문서**

- 백엔드 API 명세: `Java/docs/api/03_mypage.md`
- 프론트엔드 가이드: `softwarecampus-frontend/docs/account/03_mypage_frontend.md`
