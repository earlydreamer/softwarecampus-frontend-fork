# 로그인 프론트엔드 구현 가이드

## 현재 코드 현황

### 파일 위치
- **메인 컴포넌트**: `src/pages/LoginPage.tsx`
- **상태 관리**: `src/store/authStore.ts` (Zustand)
- **타입 정의**: `src/types/index.ts` (User)

### 현재 구현된 기능

#### 1. 로그인 폼
```typescript
// LoginPage.tsx
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState('');
const [isLoading, setIsLoading] = useState(false);
```

- ✅ 이메일 입력 필드
- ✅ 비밀번호 입력 필드
- ✅ 로딩 상태 관리
- ✅ 에러 메시지 표시
- ✅ 제출 중 버튼 비활성화

#### 2. 상태 관리 (Zustand)
```typescript
// authStore.ts
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}
```

- ✅ Zustand 사용
- ✅ LocalStorage 영속화 (zustand/persist)
- ✅ Mock 계정 데이터 (3개)
- ❌ 실제 API 연동 없음
- ❌ JWT 토큰 관리 없음

#### 3. Mock 계정
```typescript
TEMP_ACCOUNTS = {
  'admin@test.com': { password: 'test', accountType: 'ADMIN' },
  'user@test.com': { password: 'test', accountType: 'USER' },
  'academy@test.com': { password: 'user', accountType: 'ACADEMY' }
}
```

### 현재 동작 방식
```typescript
login: async (email: string, password: string) => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Mock 지연
  
  const account = TEMP_ACCOUNTS[email];
  
  if (account && account.password === password) {
    set({ user: account.user, isAuthenticated: true });
    return true;
  }
  return false;
}
```
⚠️ **문제점**: 
- 실제 API 호출 없음
- JWT 토큰 발급/저장 없음
- Refresh Token 관리 없음

---

## 백엔드 API 요구사항

### 로그인 관련 API

#### 1️⃣ 로그인
**Endpoint**: `POST /api/auth/login`

**Request**:
```typescript
{
  email: string;
  password: string;
}
```

**Response (200)**:
```typescript
{
  accessToken: string;        // JWT Access Token (1시간)
  refreshToken: string;       // UUID (7일)
  tokenType: string;          // "Bearer"
  expiresIn: number;          // 3600 (초)
  account: {
    id: number;
    email: string;
    userName: string;
    phoneNumber: string;
    accountType: "USER" | "ACADEMY" | "ADMIN";
    approvalStatus: "APPROVED" | "PENDING" | "REJECTED";
  }
}
```

**에러**:
- 401: 잘못된 이메일/비밀번호
- 401: 비활성화된 계정 (isDeleted=true)
- 401: 승인 대기 계정 (PENDING)
- 401: 승인 거부 계정 (REJECTED)

#### 2️⃣ 토큰 갱신
**Endpoint**: `POST /api/auth/refresh`

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Request**:
```typescript
{
  email: string;
  refreshToken: string;
}
```

**Response (200)**:
```typescript
{
  accessToken: string;        // 새로운 Access Token
  refreshToken: string;       // 동일한 Refresh Token
  tokenType: string;          // "Bearer"
  expiresIn: number;          // 3600
}
```

**에러**:
- 401: 인증되지 않은 요청 (토큰 없음/만료)
- 403: 이메일 불일치
- 400: 유효하지 않은 Refresh Token

#### 3️⃣ 로그아웃
**Endpoint**: `POST /api/auth/logout`

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Request**:
```typescript
{
  email: string;
}
```

**Response (204)**:
```
(No Content)
```

---

## 누락된 기능 및 구현 필요 사항

### ❌ 1. JWT 토큰 관리
**현재**: 없음  
**필요**:
- Access Token 저장 (localStorage/sessionStorage)
- Refresh Token 저장 (localStorage - httpOnly 쿠키 권장하지만 현재는 localStorage)
- 토큰 만료 시간 저장
- 자동 로그아웃 (토큰 만료 시)

### ❌ 2. Axios Interceptor
**필요**:
- Request Interceptor: 모든 요청에 Authorization 헤더 자동 추가
- Response Interceptor: 401 에러 시 토큰 갱신 시도

### ❌ 3. 자동 토큰 갱신
**필요**:
- Access Token 만료 전/후 자동 갱신
- Refresh Token으로 새 Access Token 발급
- 갱신 실패 시 로그아웃 처리

### ❌ 4. Protected Route
**필요**:
- 인증 필요 페이지 접근 제어
- 미인증 시 로그인 페이지로 리다이렉트
- 인증 후 원래 페이지로 복귀

### ❌ 5. API Service 함수
**필요한 함수** (`src/services/authService.ts`):
```typescript
// 로그인
async function login(email: string, password: string): Promise<LoginResponse>

// 토큰 갱신
async function refreshAccessToken(email: string, refreshToken: string): Promise<TokenResponse>

// 로그아웃
async function logout(email: string): Promise<void>
```

### ❌ 6. 계정 상태별 처리
**필요한 처리**:
- PENDING: "승인 대기 중인 계정입니다" 메시지
- REJECTED: "승인이 거부된 계정입니다" 메시지
- 삭제된 계정: "비활성화된 계정입니다" 메시지

---

## 개조 계획

### Step 1: API Service 계층 구축
**파일 생성**: `src/services/authService.ts`

```typescript
import axios from 'axios';
import type { User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

// Axios 인스턴스 생성
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Access Token 자동 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: 401 에러 시 토큰 갱신
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 에러 && 재시도 아닌 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const email = localStorage.getItem('email');
        const refreshToken = localStorage.getItem('refreshToken');

        if (email && refreshToken) {
          // 토큰 갱신 시도
          const newTokens = await refreshAccessToken(email, refreshToken);
          localStorage.setItem('accessToken', newTokens.accessToken);

          // 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // 갱신 실패 시 로그아웃
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// 로그인 응답 타입
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  account: User;
}

// 토큰 갱신 응답 타입
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

// 로그인
export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await api.post('/api/auth/login', { email, password });
  return response.data;
}

// 토큰 갱신
export async function refreshAccessToken(
  email: string,
  refreshToken: string
): Promise<TokenResponse> {
  const response = await api.post('/api/auth/refresh', { email, refreshToken });
  return response.data;
}

// 로그아웃
export async function logout(email: string): Promise<void> {
  await api.post('/api/auth/logout', { email });
}
```

### Step 2: authStore 수정
**파일 수정**: `src/store/authStore.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import { login as apiLogin, logout as apiLogout } from '../services/authService';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          const response = await apiLogin(email, password);

          // 토큰 저장 (localStorage)
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);
          localStorage.setItem('email', response.account.email);

          // Zustand 상태 업데이트
          set({
            user: response.account,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
          });

          return true;
        } catch (error: any) {
          // 에러 처리
          console.error('Login failed:', error);
          
          // RFC 7807 Problem Details 파싱
          if (error.response?.data?.detail) {
            throw new Error(error.response.data.detail);
          }
          
          throw new Error('로그인에 실패했습니다.');
        }
      },

      logout: async () => {
        try {
          const email = get().user?.email;
          if (email) {
            await apiLogout(email);
          }
        } catch (error) {
          console.error('Logout failed:', error);
        } finally {
          // 토큰 삭제
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('email');

          // 상태 초기화
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });
        }
      },

      setUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      // localStorage에 토큰은 따로 저장하므로 user 정보만 persist
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
```

### Step 3: LoginPage 수정
**파일 수정**: `src/pages/LoginPage.tsx`

```typescript
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 회원가입 후 리다이렉트된 경우 메시지 표시
  const signupMessage = location.state?.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      
      // 로그인 성공 시 원래 페이지 or 홈으로 이동
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 py-20">
      <div className="glass-panel p-8 rounded-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-slate-900 dark:text-white">
          로그인
        </h1>

        {/* 회원가입 성공 메시지 */}
        {signupMessage && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-400">{signupMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 에러 메시지 */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* 이메일 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="example@email.com"
              required
            />
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="비밀번호 입력"
              required
            />
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        {/* 회원가입 링크 */}
        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          계정이 없으신가요?{' '}
          <Link
            to="/signup"
            className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
          >
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
```

### Step 4: Protected Route 구현
**파일 생성**: `src/components/auth/ProtectedRoute.tsx`

```typescript
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'USER' | 'ACADEMY' | 'ADMIN';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // 인증되지 않은 경우
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 권한 확인
  if (requiredRole && user?.accountType !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
```

**App.tsx 수정**:
```typescript
import ProtectedRoute from './components/auth/ProtectedRoute';

<Route
  path="/mypage"
  element={
    <ProtectedRoute>
      <MyPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin"
  element={
    <ProtectedRoute requiredRole="ADMIN">
      <AdminPage />
    </ProtectedRoute>
  }
/>
```

### Step 5: 자동 로그아웃 처리
**파일 생성**: `src/hooks/useAuthCheck.ts`

```typescript
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export const useAuthCheck = () => {
  const { isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    const checkTokenExpiry = () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        logout();
        return;
      }

      // JWT 토큰 디코딩하여 만료 시간 확인 (옵션)
      // 만료 시 자동 로그아웃
    };

    // 주기적으로 토큰 확인 (1분마다)
    const interval = setInterval(checkTokenExpiry, 60000);

    return () => clearInterval(interval);
  }, [isAuthenticated, logout]);
};
```

---

## 토큰 저장 방식 비교

### 1. localStorage (현재 방식)
**장점**:
- 구현 간단
- 탭 간 공유
- 영속성

**단점**:
- XSS 공격 취약
- JavaScript로 접근 가능

### 2. sessionStorage
**장점**:
- 탭 종료 시 자동 삭제

**단점**:
- XSS 공격 취약
- 탭 간 미공유

### 3. httpOnly Cookie (권장)
**장점**:
- JavaScript로 접근 불가
- XSS 공격 방어

**단점**:
- CORS 설정 필요
- 백엔드 수정 필요

**현재는 localStorage 사용, 추후 httpOnly Cookie로 변경 권장**

---

## 계정 상태별 에러 메시지 매핑

```typescript
const ERROR_MESSAGES: Record<string, string> = {
  'Invalid credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
  '비활성화된 계정입니다': '탈퇴한 계정입니다.',
  '승인 대기 중인 계정입니다': '관리자 승인 후 로그인 가능합니다.',
  '승인이 거부된 계정입니다': '계정 승인이 거부되었습니다. 관리자에게 문의하세요.',
};
```

---

## 테스트 체크리스트

### 로그인
- [ ] 올바른 이메일/비밀번호로 로그인 성공
- [ ] 잘못된 이메일/비밀번호로 로그인 실패
- [ ] PENDING 계정 로그인 차단
- [ ] REJECTED 계정 로그인 차단
- [ ] 삭제된 계정 로그인 차단
- [ ] 로그인 성공 시 JWT 토큰 저장 확인
- [ ] 로그인 후 원래 페이지로 리다이렉트

### 토큰 관리
- [ ] Access Token 자동 헤더 추가
- [ ] 401 에러 시 자동 토큰 갱신
- [ ] 갱신 실패 시 자동 로그아웃
- [ ] 토큰 만료 시 로그인 페이지 이동

### Protected Route
- [ ] 미인증 시 로그인 페이지 리다이렉트
- [ ] 인증 후 원래 페이지 복귀
- [ ] 권한 없는 페이지 접근 차단

### 로그아웃
- [ ] 로그아웃 시 토큰 삭제
- [ ] 로그아웃 시 상태 초기화
- [ ] 로그아웃 후 로그인 페이지 이동

---

## 참고 문서
- 백엔드 API 명세: `Java/docs/api/02_login.md`
- Zustand 공식 문서: https://zustand-demo.pmnd.rs/
- JWT 토큰 관리 베스트 프랙티스
