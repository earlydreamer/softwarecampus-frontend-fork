# Copilot Instructions - SoftCampus Frontend

> 부트캠프/교육기관 과정 소개 및 커뮤니티 웹사이트 프론트엔드

---

## 프로젝트 아키텍처

### 기술 스택
- **React 19 + TypeScript + Vite** - SPA 프레임워크
- **TanStack Query v5** - 서버 상태 관리 (캐싱, 페칭)
- **Zustand v5** - 클라이언트 상태 관리 (인증 등)
- **React Hook Form v7** - 폼 상태 관리
- **Tailwind CSS v3** - 유틸리티 기반 스타일링
- **Axios** - HTTP 클라이언트 (`src/services/api/client.ts`)
- **Tiptap** - 리치 텍스트 에디터 (커뮤니티 글쓰기)
- **Framer Motion** - 애니메이션
- **Lucide React** - 아이콘

### 디렉토리 구조
```
src/
├── components/     # 도메인별 컴포넌트
│   ├── academy/    # 기관 관련
│   ├── course/     # 과정 관련
│   ├── home/       # 홈페이지 섹션
│   ├── auth/       # 인증 관련 (모달 등)
│   ├── editor/     # Tiptap 에디터
│   ├── layout/     # Header, Footer
│   └── ui/         # 공통 UI (AlertModal, Skeleton 등)
├── pages/          # 라우트별 페이지 컴포넌트
├── services/       # API 호출 (xxxService.ts)
│   └── api/        # Axios 클라이언트, API 타입
├── store/          # Zustand 스토어 (authStore.ts)
├── types/          # 모든 TypeScript 타입 정의 (index.ts)
├── utils/          # 유틸리티 함수
│   ├── security.ts # XSS 방지 (sanitizeInput, sanitizeUrl)
│   ├── cn.ts       # Tailwind 클래스 병합
│   └── validation.ts # 폼 검증 (이메일, 비밀번호, 전화번호)
├── hooks/          # 커스텀 훅
├── constants/      # 상수 정의
└── __tests__/      # 테스트 파일
```

---

## 핵심 패턴

### 1. 데이터 페칭 - TanStack Query

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// 조회: useQuery
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['courses', courseId],
  queryFn: () => fetchCourseById(courseId),
  enabled: !!courseId,  // 조건부 실행
});

// 변경: useMutation + invalidateQueries (캐시 갱신)
const queryClient = useQueryClient();
const createMutation = useMutation({
  mutationFn: createCourseReview,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['reviews', courseId] });
  },
  onError: (error) => {
    console.error('리뷰 작성 실패:', error);
  },
});

// 호출
createMutation.mutate({ courseId, data });
```

**queryKey 컨벤션**:
- 단일 리소스: `['courses', courseId]`
- 목록: `['courses', { categoryType, keyword }]`
- 중첩: `['courses', courseId, 'reviews']`

### 2. 인증 상태 - Zustand persist

```tsx
// src/store/authStore.ts
import { useAuthStore } from '@/store/authStore';

// 컴포넌트에서 사용
const { user, isAuthenticated, accessToken, login, logout } = useAuthStore();

// 로그인
const success = await login(email, password);
if (success) navigate('/');

// 로그아웃
logout();
```

**특징**:
- `persist` 미들웨어로 `localStorage`에 자동 저장
- `apiClient`가 `accessToken`을 자동 주입
- 토큰 만료 2분 전 선제적 갱신 (Proactive Refresh)
- 401/403 에러 시 자동 토큰 갱신 후 재시도

### 3. 폼 처리 - React Hook Form + 커스텀 검증

```tsx
import { useState } from 'react';
import { isValidEmail, isValidPassword, formatPhoneNumber } from '@/utils/validation';

// 상태 기반 폼 (SignupPage.tsx 참고)
const [formData, setFormData] = useState<SignupFormData>({
  email: '',
  password: '',
  userName: '',
  phoneNumber: '',
  // ...
});

const [errors, setErrors] = useState<Partial<Record<keyof SignupFormData, string>>>({});

// 검증 함수
const validateForm = (): boolean => {
  const newErrors: typeof errors = {};
  
  if (!formData.email) {
    newErrors.email = '이메일은 필수입니다';
  } else if (!isValidEmail(formData.email)) {
    newErrors.email = '유효한 이메일 형식이 아닙니다';
  }
  
  if (!isValidPassword(formData.password)) {
    newErrors.password = '비밀번호는 8~20자, 영문+숫자+특수문자 포함';
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

// 전화번호 자동 포맷팅
const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const formatted = formatPhoneNumber(e.target.value.replace(/[^0-9]/g, ''));
  setFormData(prev => ({ ...prev, phoneNumber: formatted }));
};
```

### 4. 보안 유틸리티 필수 사용

```tsx
import { sanitizeInput, sanitizeUrl, sanitizeObject } from '@/utils/security';
import DOMPurify from 'dompurify';

// HTML 입력 살균 (XSS 방지) - 사용자 입력 HTML 렌더링 시 필수
const safeHtml = sanitizeInput(userInput);
<div dangerouslySetInnerHTML={{ __html: safeHtml }} />

// URL 검증 (javascript:, data:, vbscript: 차단)
const safeUrl = sanitizeUrl(externalUrl);
// 빈 문자열 반환 시 위험한 URL이므로 기본값 사용
const imageUrl = sanitizeUrl(dto.imageUrl) || DEFAULT_IMAGES.COURSE_THUMBNAIL;

// 객체 내 모든 문자열 재귀 살균
const safeData = sanitizeObject(apiResponse);
```

### 5. 스타일링 패턴

```tsx
import { cn } from '@/utils/cn';  // clsx + tailwind-merge

// 조건부 클래스 병합
<button className={cn(
  'px-4 py-2 rounded-lg font-medium transition-colors',
  isActive && 'bg-primary-600 text-white',
  disabled && 'opacity-50 cursor-not-allowed',
  className  // props로 받은 추가 클래스
)} />

// Glass Panel 패턴 (DESIGN-SYSTEM.md 참고)
<div className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-2xl p-6 shadow-lg" />

// Dark Mode 지원
<p className="text-slate-900 dark:text-white" />
<div className="bg-white dark:bg-slate-800" />
```

---

## 리치 텍스트 에디터 - Tiptap

커뮤니티 글쓰기/수정에 사용 (`src/components/editor/TiptapEditor.tsx`)

```tsx
import TiptapEditor, { type AttachedFile } from '@/components/editor/TiptapEditor';

// 기본 사용
<TiptapEditor
  content={content}
  onChange={setContent}
/>

// 파일 첨부 기능 포함
const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);

<TiptapEditor
  content={content}
  onChange={setContent}
  enableFileAttachment={true}
  attachedFiles={attachedFiles}
  onFilesChange={setAttachedFiles}
  maxFileSize={10 * 1024 * 1024}  // 10MB
  maxFileCount={5}
/>
```

**지원 기능**:
- 텍스트 스타일: 굵게, 기울임, 밑줄, 취소선, 형광펜
- 제목: H1, H2, H3
- 리스트: 글머리 기호, 번호, 체크리스트
- 정렬: 왼쪽, 가운데, 오른쪽, 양쪽
- 링크, 이미지 삽입, 인용구, 코드
- 파일 첨부: 드래그앤드롭, 이미지 미리보기

---

## 테스트 작성 - Vitest + React Testing Library

### 테스트 실행 명령어

```bash
npm test              # 1회 실행
npm run test:watch    # Watch 모드
npm run test:ui       # UI 모드 (브라우저)
npm run test:coverage # 커버리지 리포트
```

### 테스트 파일 구조

```
src/
├── __tests__/           # 통합 테스트
│   └── setup.test.tsx   # 테스트 환경 검증
├── utils/
│   └── __tests__/       # 유닛 테스트 (유틸리티 함수)
└── setupTests.ts        # 전역 설정 (jest-dom, mocks)
```

### 테스트 작성 예시

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 컴포넌트 테스트
describe('MyComponent', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  
  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{ui}</BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('버튼 클릭 시 모달이 열려야 함', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MyComponent />);
    
    await user.click(screen.getByRole('button', { name: '열기' }));
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});
```

### Mock 설정 (setupTests.ts)

```typescript
// window.matchMedia (Tailwind CSS)
Object.defineProperty(window, 'matchMedia', {
  value: (query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }),
});

// IntersectionObserver (Framer Motion)
global.IntersectionObserver = class {
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// ResizeObserver
global.ResizeObserver = class {
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;
```

---

## API 서비스 작성

### 서비스 파일 구조

```typescript
// src/services/courseService.ts
import apiClient from './api/client';
import type { Course, CourseReview } from '@/types';
import type { ApiCourseResponse } from './api/types';

// DTO → 프론트엔드 모델 변환 헬퍼
const mapDtoToCourse = (dto: ApiCourseResponse): Course => ({
  id: dto.id,
  name: dto.name,
  academy: {
    id: dto.academyId,
    name: dto.academyName,
    // ...
  },
  // 프론트엔드 전용 필드
  imageUrl: sanitizeUrl(dto.imageUrl) || DEFAULT_IMAGES.COURSE_THUMBNAIL,
  duration: formatCourseDuration(dto.courseStart, dto.courseEnd),
});

// 목록 조회 (Page 응답)
export const fetchCourses = async (filters?: CourseFilterParams): Promise<Course[]> => {
  const response = await apiClient.get<{ content: ApiCourseResponse[] }>('/api/courses', {
    params: {
      keyword: filters?.keyword,
      categoryType: filters?.categoryType !== 'ALL' ? filters?.categoryType : undefined,
      page: 0,
      size: 20,
    },
  });
  return response.data.content.map(mapDtoToCourse);
};

// 단건 조회
export const fetchCourseById = async (courseId: number): Promise<Course | null> => {
  try {
    const response = await apiClient.get<ApiCourseDetailResponse>(`/api/courses/${courseId}`);
    return mapDetailDtoToCourse(response.data);
  } catch (error) {
    console.error(`Failed to fetch course ${courseId}:`, error);
    return null;
  }
};

// 생성/수정 (FormData - 파일 업로드)
export const uploadReviewFile = async (courseId: number, reviewId: number, file: File): Promise<void> => {
  const formData = new FormData();
  formData.append('file', file);
  
  await apiClient.post(`/api/courses/${courseId}/reviews/${reviewId}/file`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
```

### API 클라이언트 특징 (api/client.ts)

- **토큰 자동 주입**: `auth-storage`에서 읽어서 `Authorization` 헤더 설정
- **선제적 갱신**: 만료 2분 전 자동으로 refresh 토큰 요청
- **401/403 자동 재시도**: 토큰 갱신 후 원래 요청 재시도
- **동시 요청 처리**: 토큰 갱신 중 다른 요청은 대기열에 추가

---

## 타입 정의 규칙

모든 타입은 `src/types/index.ts`에 정의 - **백엔드 엔티티/DTO 기준**

### 주요 타입

```typescript
// Enum 타입 (백엔드와 일치)
type AccountType = 'USER' | 'ACADEMY' | 'ADMIN';
type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
type BoardCategory = 'NOTICE' | 'QUESTION' | 'COURSE_STORY' | 'CODING_STORY';
type CategoryType = 'EMPLOYEE' | 'JOB_SEEKER';

// 엔티티 타입
interface Account {
  id: number;
  email: string;
  userName: string;           // 백엔드 기준 (name ❌)
  phoneNumber: string;
  accountType: AccountType;
  approvalStatus: ApprovalStatus;  // accountApproved ❌
  // ...
}

interface Board {
  id: number;
  title: string;
  text: string;               // content ❌
  hits: number;               // viewCount ❌
  category: BoardCategory;
  account: { id: number; userName: string };  // author ❌
  likeCount: number;          // recommendations ❌
  // ...
}
```

### 네이밍 매핑 (BACKEND_FRONTEND_MAPPING.md 참고)

| 백엔드 필드 | 프론트엔드 필드 | 잘못된 예 |
|------------|---------------|----------|
| `text` | `text` | `content` |
| `hits` | `hits` | `viewCount` |
| `userName` | `userName` | `name` |
| `approvalStatus` | `approvalStatus` | `isApproved`, `accountApproved` |
| `likeCount` | `likeCount` | `recommendations` |
| `account` | `account` | `author` |

---

## 컴포넌트 작성 규칙

### 접근성 필수

```tsx
// 모달: aria 속성 + 포커스 트랩 (AlertModal.tsx 참고)
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby={titleId}
  aria-describedby={descriptionId}
>
  <h3 id={titleId}>제목</h3>
  <p id={descriptionId}>설명</p>
  <button ref={closeBtnRef} autoFocus>확인</button>
</div>

// 아이콘 버튼: aria-label 필수
<button aria-label="검색">
  <Search className="w-5 h-5" />
</button>

// 폼 필드: label 연결
<label htmlFor="email">이메일</label>
<input id="email" type="email" />

// 시맨틱 HTML
<nav aria-label="메인 네비게이션">...</nav>
<main>...</main>
<footer>...</footer>
```

### 에러/로딩 UI

```tsx
// 로딩 스켈레톤
if (isLoading) {
  return <Skeleton className="h-64 w-full rounded-2xl" />;
}

// 에러 상태 + 재시도
if (error) {
  return (
    <div className="text-center py-12">
      <p className="text-red-500 mb-4">데이터를 불러올 수 없습니다.</p>
      <button onClick={() => refetch()} className="btn-primary">
        다시 시도
      </button>
    </div>
  );
}

// 빈 상태
if (!data || data.length === 0) {
  return <p className="text-slate-500">등록된 과정이 없습니다.</p>;
}
```

### 알림 모달 상태 관리 패턴

```tsx
import type { AlertModalState } from '@/types';

const [alertModal, setAlertModal] = useState<AlertModalState>({
  isOpen: false,
  title: '',
  message: '',
  type: 'info',
});

// 모달 열기
setAlertModal({
  isOpen: true,
  title: '성공',
  message: '저장되었습니다.',
  type: 'success',
  onCloseCallback: () => navigate('/'),
});

// 컴포넌트
<AlertModal
  isOpen={alertModal.isOpen}
  title={alertModal.title}
  message={alertModal.message}
  type={alertModal.type}
  onClose={() => {
    setAlertModal(prev => ({ ...prev, isOpen: false }));
    alertModal.onCloseCallback?.();
  }}
/>
```

---

## Docker 배포

### 로컬 빌드 및 실행

```bash
# 이미지 빌드
docker build -f docker/frontend/Dockerfile -t softcampus-frontend:latest .

# 컨테이너 실행
docker-compose up -d

# 로그 확인
docker logs softcampus-frontend
```

### 배포 구조

```
docker/
└── frontend/
    ├── Dockerfile      # Multi-stage 빌드 (Node → Nginx)
    └── nginx.conf      # SPA 라우팅 + 보안 헤더

docker-compose.yml      # 프로덕션 설정 (포트 18080)
```

### Dockerfile 특징

1. **Multi-stage 빌드**: 빌드 환경(Node.js)과 서빙 환경(Nginx) 분리
2. **경량화**: `nginx:alpine` 기반 (~25MB)
3. **환경변수**: CI에서 `.env` 파일 주입 후 빌드

### Nginx 설정 (nginx.conf)

- **SPA 라우팅**: `try_files $uri $uri/ /index.html`
- **정적 자산 캐싱**: `/assets/`는 1년 캐싱
- **보안 헤더**: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
- **Gzip 압축**: JS, CSS, JSON 등

### CI/CD (GitHub Actions)

`.github/workflows/deploy.yml`:
1. 환경변수 주입 (`secrets.FRONTEND_ENV` → `.env`)
2. Docker 이미지 빌드
3. EC2로 이미지 전송 (SCP)
4. docker-compose로 배포
5. Health Check 후 롤백 또는 정리

---

## 명령어

```bash
# 개발
npm run dev          # 개발 서버 (Vite, http://localhost:5173)
npm run build        # 프로덕션 빌드
npm run preview      # 빌드 결과 미리보기
npm run lint         # ESLint 검사

# 테스트
npm test             # Vitest 1회 실행
npm run test:watch   # Watch 모드
npm run test:ui      # UI 모드
npm run test:coverage # 커버리지 리포트
```

---

## 주요 문서

| 문서 | 설명 |
|------|------|
| `AGENTS.md` | AI 에이전트 공통 지침 (코드 품질, Git 워크플로우) |
| `FRONTEND-STACKS.md` | 기술 스택 버전 정보 |
| `DESIGN-SYSTEM.md` | 색상, 타이포그래피, 컴포넌트 스타일 |
| `BACKEND_FRONTEND_MAPPING.md` | 백엔드 필드명 매핑 |
| `GEMINI.md` | Gemini 전용 지침 |

---

## 주의사항

1. **타입 선언**: `any` 사용 금지, 명시적 타입 정의
2. **네이밍**: 백엔드 엔티티 기준 (예: `text` not `content`, `hits` not `viewCount`)
3. **환경변수**: 클라이언트 노출 변수는 `VITE_` 접두사 필수
4. **보안**: 사용자 입력 HTML은 반드시 `sanitizeInput()` 처리
5. **URL 검증**: 외부 URL은 `sanitizeUrl()`로 검증
6. **main 브랜치**: 직접 push 금지, PR 통해 병합
7. **테스트**: 중요 로직 변경 시 테스트 작성
8. **접근성**: 모달, 버튼에 aria 속성 필수
