# 작업 로그: 내부 내비게이션 구현

## 작업 개요
`softwarecampus-test` 프로젝트의 내부 내비게이션이 동작하지 않는 문제를 해결하기 위해, 기존 `softwarecampus-frontend`의 내비게이션 구조를 분석하고 이를 새로운 프로젝트에 이식했습니다. 또한, 트렌디한 디자인을 유지하면서 필요한 모든 페이지의 플레이스홀더를 생성하고 라우팅을 설정했습니다.

## 수행된 작업

### 1. 내비게이션 상수 이식
- `softwarecampus-frontend/constants/navigation.ts` 파일을 `softwarecampus-test/src/constants/navigation.ts`로 복사하여 메뉴 구조(과정, 커뮤니티 등)를 가져왔습니다.

### 2. 페이지 컴포넌트 생성
다음 페이지들을 `src/pages`에 생성하고, Glassmorphism 디자인을 적용했습니다:
- **과정 관련**: `CourseListPage`, `CourseDetailPage`
- **학원 관련**: `AcademyListPage`, `AcademyDetailPage`, `AcademyCreatePage`
- **커뮤니티 관련**: `CommunityPage`, `CommunityDetailPage`, `CommunityWritePage`, `CommunityEditPage`
- **인증 관련**: `LoginPage`, `SignupPage`
- **기타**: `MyPage`, `AdminPage`, `NotFound`, `PlaceholderPage`

### 3. 라우팅 설정 (`App.tsx`)
- `react-router-dom`을 사용하여 모든 페이지에 대한 라우트를 정의했습니다.
- `/lectures`, `/academies`, `/community` 등 주요 경로와 하위 경로를 설정했습니다.

### 4. 헤더 컴포넌트 업데이트 (`Header.tsx`)
- `rawCourseNav` 데이터를 사용하여 동적 메가 메뉴(Mega Menu)를 구현했습니다.
- 데스크탑 및 모바일 환경 모두에서 작동하는 반응형 내비게이션을 구축했습니다.
- Tailwind CSS를 활용하여 호버 효과와 드롭다운 애니메이션을 적용했습니다.

### 5. 빌드 오류 수정
- 새로 생성된 페이지들에서 사용하지 않는 `React` 임포트를 제거하여 TypeScript 빌드 오류를 해결했습니다.
- `Header.tsx`에서 `verbatimModuleSyntax` 옵션 준수를 위해 타입 임포트(`import type`)를 수정했습니다.

## 결과
- `npm run build`가 성공적으로 완료되었습니다.
- 모든 내비게이션 링크가 실제 경로로 연결되며, 각 페이지는 기본적인 레이아웃과 디자인을 갖추고 있습니다.

## 검증 (브라우저 테스트)
다음 페이지들에 대한 렌더링 및 내비게이션 검증을 완료했습니다:
1. **로그인 페이지**: 정상 렌더링 확인 (`login_page.png`)
2. **회원가입 페이지**: 정상 렌더링 확인 (`signup_page.png`)
3. **과정 목록 페이지**: 정상 렌더링 확인 (`course_list_page.png`)
4. **커뮤니티 페이지**: 정상 렌더링 확인 (`community_page.png`)
5. **훈련기관 목록 페이지**: 정상 렌더링 확인 (`academy_list_page.png`)


## 추가 구현 사항 (누락 요소 보완)
사용자 요청에 따라 `softwarecampus-frontend`에 존재하던 다음 요소들을 모두 구현했습니다:

### 1. 타입 시스템 이식 (`src/types/index.ts`)
- `AccountType`, `ApprovalStatus`, `BoardCategory` 등 핵심 Enum 타입 정의
- `Course`, `Academy`, `Board`, `CommunityPost` 등 주요 인터페이스 정의
- 백엔드 엔티티와 프론트엔드 UI 간의 매핑을 위한 타입 호환성 확보

### 2. Mock 데이터 및 서비스 계층 (`src/services`)
- **Mock Data**: `mockData.ts`에 배너, 과정 목록, 커뮤니티 게시글 등의 더미 데이터를 생성하여 실제 API 없이도 화면이 풍부하게 보이도록 구성
- **Services**: `homeService.ts`, `courseService.ts`, `communityService.ts`를 생성하여 데이터 페칭 로직을 모듈화

### 3. UI 컴포넌트 고도화 (`src/components`)
- **HeroBanner**: `react-slick` 대신 커스텀 슬라이더를 구현하여 메인 배너 기능 완성 (자동 슬라이드, 네비게이션 버튼)
- **CourseCard**: Glassmorphism 디자인이 적용된 과정 카드 컴포넌트 구현 (호버 효과, 평점/리뷰 수 표시)
- **CourseSection**: 과정 목록을 가로 스크롤 또는 그리드 형태로 보여주는 섹션 컴포넌트
- **CommunitySection**: 커뮤니티 베스트 게시글을 보여주는 섹션 컴포넌트
- **Skeleton**: 데이터 로딩 중 사용자 경험을 위한 스켈레톤 UI 컴포넌트 추가

### 4. 페이지 로직 완성 (`src/pages`)
- **LandingPage**: `useQuery`를 사용하여 배너, 과정 섹션, 커뮤니티 하이라이트 데이터를 비동기로 로딩하고 화면에 렌더링
- **CourseListPage**: URL 쿼리 파라미터(`target`, `format`, `q`)와 연동되는 필터링 로직 구현 (`react-hook-form` 사용)
- **CommunityPage**: 카테고리 탭(`NOTICE`, `CAREER`, `CODING`) 및 페이지네이션 기능 구현

### 5. 설정 및 인프라
- **TanStack Query 설정**: `main.tsx`에 `QueryClientProvider`를 추가하여 데이터 페칭 인프라 구축
- **TypeScript 설정**: `verbatimModuleSyntax` 호환성을 위해 모든 타입 임포트를 `import type`으로 수정

## 최종 검증
- **메인 페이지**: 히어로 배너 슬라이드, 과정 섹션, 커뮤니티 섹션 정상 렌더링 확인 (`main_page_full.png`)
- **과정 목록 페이지**: 필터링 UI 및 과정 카드 그리드 정상 렌더링 확인 (`course_list_page_final.png`)
- **커뮤니티 페이지**: 카테고리 탭 및 게시글 목록 정상 렌더링 확인 (`community_page_final.png`)

---

## 2025-11-20: 백엔드 엔티티 기준 타입 정리

### 작업 목표
백엔드(`softwarecampus-backend`) 엔티티를 기준으로 프론트엔드 타입 시스템을 정확히 일치시키기

### 수행 작업

#### 1. 백엔드 엔티티 분석
다음 엔티티들의 필드명과 타입을 확인:
- `Account.java`: `userName`, `phoneNumber`, `accountType`, `accountApproved` 등
- `Board.java`: `title`, `text`, `category`, `hits`, `secret` 등
- `Course.java`: `name`, `academy`, `category`, `isKdt`, `isNailbaeum`, `isOffline` 등
- `Academy.java`: `name`, `address`, `businessNumber`, `email`, `isApproved` 등
- **Enum 타입들**: `AccountType`, `ApprovalStatus`, `BoardCategory`, `CategoryType`

#### 2. 타입 정의 수정 (`src/types/index.ts`)
- **ApprovalStatus**: `'WAITING'` 제거 → `'PENDING' | 'APPROVED' | 'REJECTED'` (백엔드 기준)
- **BoardCategory**: `'NOTICE' | 'QUESTION' | 'COURSE_STORY' | 'CODING_STORY'` 확정
- **AcademyField**: 백엔드에 없는 프론트엔드 전용 필드로 유연한 타입 정의

#### 3. Mock 데이터 수정 (`src/services/mockData.ts`)
- `fields` 배열의 값을 `AcademyField` 타입에 맞게 수정
  - `'데이터·AI'` → `'데이터/AI'`
  - 타입 단언(`as const`) 추가

#### 4. UI 컴포넌트 수정 (`src/pages/CommunityPage.tsx`)
- 존재하지 않는 `'CAREER'` 카테고리 체크 제거
- `'NOTICE'`, `'QUESTION'`, 기타로 분류하도록 수정

### 빌드 결과
✅ **빌드 성공** (`npm run build`)
- TypeScript 컴파일 오류 0개
- Vite 빌드 완료 (4.26s)
- 번들 크기: 399.12 kB (gzip: 120.92 kB)

### 다음 작업 계획
1. 백엔드 API 엔드포인트와 연동 준비
2. 인증/인가 로직 구현 (JWT 토큰 기반)
3. 실제 데이터 CRUD 기능 구현
4. 파일 업로드 (S3) 기능 연동
5. 상세 페이지 구현 (과정 상세, 학원 상세, 게시글 상세)

---

## 2025-11-20 (2): 커뮤니티 게시글 상세 페이지 구현

### 작업 목표
백엔드 엔티티 기준으로 현대적인 디자인의 커뮤니티 게시글 상세 페이지 구현

### 수행 작업

#### 1. 타입 정의 추가 (`src/types/index.ts`)
- **Comment 인터페이스** 추가:
  - `id`, `boardId`, `author`, `text`, `createdAt`, `updatedAt`, `isDeleted`
  - 백엔드 Comment 엔티티 구조 반영

#### 2. 서비스 계층 확장 (`src/services/communityService.ts`)
구현된 함수들:
- **fetchBoardPost**: 게시글 상세 조회 (조회수 증가, 추천 여부 포함)
- **fetchComments**: 댓글 목록 조회
- **recommendBoardPost**: 게시글 추천
- **createComment**: 댓글 작성 (500자 제한)
- **updateComment**: 댓글 수정
- **deleteComment**: 댓글 삭제

#### 3. UI 구현 (`src/pages/CommunityDetailPage.tsx`)

**주요 기능:**
- ✅ 게시글 상세 정보 표시 (제목, 작성자, 작성일, 조회수, 댓글수, 추천수)
- ✅ 카테고리별 색상 구분 (NOTICE, QUESTION, COURSE_STORY, CODING_STORY)
- ✅ 추천 기능 (로그인 필수, 중복 추천 방지)
- ✅ 댓글 작성/수정/삭제 (본인만 가능)
- ✅ 실시간 날짜 포맷팅 ("방금 전", "3분 전", "2시간 전" 등)
- ✅ 에러 처리 및 로딩 상태
- ✅ 반응형 디자인 (모바일/데스크탑)

**디자인 특징:**
- **Glassmorphism 스타일**: 투명도와 블러 효과를 활용한 현대적 UI
- **그라데이션 버튼**: Blue → Indigo 그라데이션 적용
- **호버 애니메이션**: 추천 버튼 호버 시 확대 및 그림자 효과
- **아이콘 통합**: Lucide React 아이콘 사용
- **다크모드 지원**: 완벽한 다크모드 테마

**TanStack Query 활용:**
- `useQuery`: 게시글 및 댓글 데이터 페칭
- `useMutation`: 추천, 댓글 CRUD 작업
- 자동 캐시 무효화 (`invalidateQueries`)

### 빌드 결과
✅ **빌드 성공** (`npm run build`)
- TypeScript 컴파일 오류 0개
- Vite 빌드 완료 (3.28s)
- 번들 크기: 418.99 kB (gzip: 125.82 kB)

### 개발 서버
✅ **서버 실행 중**: http://localhost:5174/

### 다음 작업 계획
1. 과정 상세 페이지 구현
2. 학원 상세 페이지 구현
3. 게시글 작성/수정 페이지 구현 (TipTap 에디터)
4. 마이페이지 구현
5. 백엔드 API 연동 준비

---

## 2025-11-20 (3): 커뮤니티 글쓰기 페이지 구현

### 작업 목표
Tiptap 리치 텍스트 에디터를 적용한 현대적인 글쓰기 페이지 구현

### 수행 작업

#### 1. Tiptap 에디터 패키지 설치
설치된 패키지들:
- `@tiptap/react`: Tiptap React 컴포넌트
- `@tiptap/starter-kit`: 기본 확장 기능 번들
- `@tiptap/extension-placeholder`: 플레이스홀더
- `@tiptap/extension-link`: 링크 삽입
- `@tiptap/extension-image`: 이미지 삽입
- `@tiptap/extension-color`: 텍스트 색상
- `@tiptap/extension-text-style`: 텍스트 스타일
- `@tiptap/extension-highlight`: 형광펜
- `@tiptap/extension-text-align`: 텍스트 정렬
- `@tiptap/extension-underline`: 밑줄
- `@tiptap/extension-task-list`: 체크리스트
- `@tiptap/extension-task-item`: 체크리스트 항목

총 73개 패키지 추가 설치 완료

#### 2. Tiptap 에디터 스타일 구현 (`src/styles/tiptap.css`)
- 에디터 기본 스타일 정의
- 제목, 리스트, 인용구, 코드 블록 등 스타일링
- 다크모드 완벽 지원
- 반응형 이미지 처리
- 체크리스트 및 테이블 스타일

#### 3. Tiptap 에디터 컴포넌트 구현 (`src/components/editor/TiptapEditor.tsx`)

**에디터 기능:**
- ✅ 텍스트 스타일: 굵게, 기울임, 밑줄, 취소선, 형광펜
- ✅ 제목: H1, H2, H3
- ✅ 리스트: 글머리 기호, 번호 매기기, 체크리스트
- ✅ 정렬: 왼쪽, 가운데, 오른쪽, 양쪽
- ✅ 기타: 인용구, 코드, 링크, 이미지
- ✅ 실행 취소/다시 실행

**툴바 UI:**
- Lucide React 아이콘 사용
- 버튼 상태 표시 (활성/비활성)
- 그룹별 구분선
- 호버 효과 및 다크모드 지원
- 툴팁 제공

**보안 기능:**
- URL 입력 시 프로토콜 검증 (http/https만 허용)
- URL 파싱 검증으로 XSS 방지

#### 4. 서비스 계층 확장 (`src/services/communityService.ts`)
- **createBoardPost** 함수 추가:
  - 제목 길이 검증 (255자 제한)
  - 내용 검증
  - 새 게시글 생성 및 반환

#### 5. 글쓰기 페이지 구현 (`src/pages/CommunityWritePage.tsx`)

**주요 기능:**
- ✅ 카테고리 선택 (4가지: 공지사항, 문의사항, 진로이야기, 코딩이야기)
- ✅ 제목 입력 (실시간 글자 수 표시)
- ✅ Tiptap 리치 텍스트 에디터
- ✅ 작성 취소 시 확인 다이얼로그
- ✅ 폼 유효성 검증
- ✅ TanStack Query를 통한 상태 관리

**디자인 특징:**
- **Glassmorphism 스타일**: 투명도와 블러 효과
- **그라데이션 버튼**: 카테고리 선택 및 제출 버튼
- **반응형 레이아웃**: 모바일/태블릿/데스크탑 최적화
- **로딩 상태**: Suspense를 활용한 에디터 lazy loading
- **완벽한 다크모드**: 모든 UI 요소 다크모드 지원

**사용자 경험:**
- 에디터 로딩 중 스피너 표시
- 작성 중 상태 표시
- 취소 시 데이터 손실 방지 확인
- 실시간 피드백 (글자 수, 버튼 상태 등)

### 빌드 결과
✅ **빌드 성공** (`npm run build`)
- TypeScript 컴파일 오류 0개
- Vite 빌드 완료 (4.34s)
- 번들 크기: 
  - TiptapEditor: 384.73 kB (gzip: 121.41 kB)
  - Main: 424.40 kB (gzip: 126.95 kB)

### 기술 스택
- **Tiptap**: 현대적인 WYSIWYG 에디터
- **React Query**: 데이터 상태 관리
- **Lucide React**: 아이콘
- **Lazy Loading**: 에디터 코드 스플리팅
- **Tailwind CSS**: 스타일링

### 다음 작업 계획
1. 게시글 수정 페이지 구현 (기존 글 불러오기)
2. 과정 상세 페이지 구현
3. 학원 상세 페이지 구현
4. 마이페이지 구현
5. 백엔드 API 연동



