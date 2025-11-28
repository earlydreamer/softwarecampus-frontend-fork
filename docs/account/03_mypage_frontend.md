# 마이페이지 프론트엔드 구현 가이드

## 현재 코드 현황

### 파일 위치
- **메인 컴포넌트**: `src/pages/MyPage.tsx`
- **상태 관리**: `src/store/authStore.ts` (user 정보)
- **타입 정의**: `src/types/index.ts` (User)

### 현재 구현된 기능

#### 1. UI 구성
```typescript
type TabType = 'overview' | 'posts' | 'comments' | 'bookmarks';
```

- ✅ 프로필 정보 표시
  - 사용자명, 이메일, 전화번호
  - 계정 타입 (USER/ACADEMY/ADMIN)
  - 승인 상태 (APPROVED/PENDING/REJECTED)
  - 소속, 직책, 주소 (선택 필드)
- ✅ 탭 메뉴 (overview, posts, comments, bookmarks)
- ✅ Mock 데이터로 게시글/댓글/북마크 표시
- ✅ 프로필 사진 placeholder
- ❌ 실제 프로필 수정 기능 없음
- ❌ 계정 삭제 기능 없음
- ❌ API 연동 없음

#### 2. 표시되는 정보 (User 타입)
```typescript
interface User {
  id: number;
  email: string;
  userName: string;
  phoneNumber: string;
  accountType: AccountType;
  approvalStatus: ApprovalStatus;
  address: string | null;
  affiliation: string | null;
  position: string | null;
  academyId?: number | null;
}
```

### 현재 동작 방식
```typescript
const MyPage = () => {
  const { user, isAuthenticated } = useAuthStore();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Mock 데이터로 화면 렌더링
};
```
⚠️ **문제점**: 
- authStore의 user 정보만 표시 (API 조회 없음)
- 프로필 수정/삭제 기능 없음
- 실시간 데이터 동기화 없음

---

## 백엔드 API 요구사항

### 마이페이지 API

#### 1️⃣ 프로필 조회
**Endpoint**: `GET /api/mypage/profile`

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response (200)**:
```typescript
{
  id: number;
  email: string;
  userName: string;
  phoneNumber: string;
  accountType: "USER" | "ACADEMY" | "ADMIN";
  approvalStatus: "APPROVED" | "PENDING" | "REJECTED";
}
```

**특징**:
- JWT 토큰에서 이메일 추출하여 조회
- 삭제된 계정은 404 반환

#### 2️⃣ 프로필 수정
**Endpoint**: `PATCH /api/mypage/profile`

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Request** (Partial Update):
```typescript
{
  userName?: string;           // 2~50자
  phoneNumber?: string;        // 010-XXXX-XXXX, 중복 불가
}
```

**Response (200)**:
```typescript
{
  id: number;
  email: string;
  userName: string;
  phoneNumber: string;
  accountType: "USER" | "ACADEMY" | "ADMIN";
  approvalStatus: "APPROVED" | "PENDING" | "REJECTED";
}
```

**에러**:
- 400: Validation 실패
- 404: 계정 없음
- 409: 전화번호 중복

**특징**:
- 요청 본문에 포함된 필드만 수정
- null 값은 무시 (기존 값 유지)

#### 3️⃣ 계정 삭제
**Endpoint**: `DELETE /api/mypage/account`

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response (204)**:
```
(No Content)
```

**에러**:
- 404: 계정 없음

**특징**:
- 소프트 삭제 (isDeleted=true)
- 삭제 후 로그인 불가
- 작성한 게시글/댓글은 유지

---

## 누락된 기능 및 구현 필요 사항

### ❌ 1. 프로필 조회 API 연동
**현재**: authStore의 user만 표시  
**필요**:
- 컴포넌트 마운트 시 API 호출
- 최신 프로필 정보 조회
- 로딩/에러 상태 처리

### ❌ 2. 프로필 수정 UI
**현재**: "프로필 수정" 버튼만 존재  
**필요**:
- 수정 모달 or 수정 페이지
- userName, phoneNumber 입력 필드
- Validation (클라이언트 + 서버)
- 수정 성공 시 authStore 업데이트

### ❌ 3. 계정 삭제 UI
**필요**:
- 계정 삭제 버튼
- 확인 다이얼로그 (경고 메시지)
- 삭제 성공 시 로그아웃 처리

### ❌ 4. API Service 함수
**필요한 함수** (`src/services/mypageService.ts`):
```typescript
// 프로필 조회
async function getProfile(): Promise<User>

// 프로필 수정
async function updateProfile(data: Partial<User>): Promise<User>

// 계정 삭제
async function deleteAccount(): Promise<void>
```

### ❌ 5. 상태 관리
**필요한 상태**:
```typescript
const [isEditModalOpen, setIsEditModalOpen] = useState(false);
const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
const [isLoading, setIsLoading] = useState(false);
const [editForm, setEditForm] = useState({ userName: '', phoneNumber: '' });
```

---

## 개조 계획

### Step 1: API Service 계층 구축
**파일 생성**: `src/services/mypageService.ts`

```typescript
import { api } from './authService';
import type { User } from '../types';

// 프로필 수정 요청 타입
export interface UpdateProfileRequest {
  userName?: string;
  phoneNumber?: string;
}

// 프로필 조회
export async function getProfile(): Promise<User> {
  const response = await api.get('/api/mypage/profile');
  return response.data;
}

// 프로필 수정 (Partial Update)
export async function updateProfile(data: UpdateProfileRequest): Promise<User> {
  const response = await api.patch('/api/mypage/profile', data);
  return response.data;
}

// 계정 삭제
export async function deleteAccount(): Promise<void> {
  await api.delete('/api/mypage/account');
}
```

### Step 2: 프로필 조회 로직 추가
**파일 수정**: `src/pages/MyPage.tsx`

```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getProfile } from '../services/mypageService';

const MyPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // 프로필 조회
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const profile = await getProfile();
        setUser(profile); // authStore 업데이트
      } catch (err: any) {
        if (err.response?.status === 401) {
          // 인증 실패 시 로그인 페이지로
          navigate('/login');
        } else {
          setError('프로필을 불러오는데 실패했습니다.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, navigate, setUser]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">프로필 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  // ... 기존 렌더링 로직
};
```

### Step 3: 프로필 수정 모달 컴포넌트
**파일 생성**: `src/components/mypage/EditProfileModal.tsx`

```typescript
import { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import { updateProfile } from '../../services/mypageService';
import type { User } from '../../types';
import { isValidPhoneNumber, formatPhoneNumber } from '../../utils/validation';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSuccess: (updatedUser: User) => void;
}

const EditProfileModal = ({ isOpen, onClose, user, onSuccess }: EditProfileModalProps) => {
  const [userName, setUserName] = useState(user.userName);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ userName?: string; phoneNumber?: string; submit?: string }>({});

  useEffect(() => {
    if (isOpen) {
      setUserName(user.userName);
      setPhoneNumber(user.phoneNumber);
      setErrors({});
    }
  }, [isOpen, user]);

  const handlePhoneNumberChange = (value: string) => {
    const formatted = formatPhoneNumber(value.replace(/[^0-9]/g, ''));
    setPhoneNumber(formatted);
    if (errors.phoneNumber) {
      setErrors(prev => ({ ...prev, phoneNumber: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: { userName?: string; phoneNumber?: string } = {};

    if (userName.length < 2 || userName.length > 50) {
      newErrors.userName = '사용자명은 2~50자여야 합니다';
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      newErrors.phoneNumber = '올바른 전화번호 형식이 아닙니다 (010-XXXX-XXXX)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // 변경된 필드만 전송 (Partial Update)
      const updateData: { userName?: string; phoneNumber?: string } = {};
      
      if (userName !== user.userName) {
        updateData.userName = userName;
      }
      
      if (phoneNumber !== user.phoneNumber) {
        updateData.phoneNumber = phoneNumber;
      }

      // 변경사항 없으면 그냥 닫기
      if (Object.keys(updateData).length === 0) {
        onClose();
        return;
      }

      const updatedUser = await updateProfile(updateData);
      onSuccess(updatedUser);
      onClose();
    } catch (err: any) {
      if (err.response?.data?.detail) {
        setErrors({ submit: err.response.data.detail });
      } else if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ submit: '프로필 수정에 실패했습니다.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">프로필 수정</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 전역 에러 */}
          {errors.submit && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.submit}</span>
            </div>
          )}

          {/* 사용자명 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              사용자명
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value);
                if (errors.userName) setErrors(prev => ({ ...prev, userName: undefined }));
              }}
              className={`w-full px-4 py-3 border ${
                errors.userName ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
              } rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none`}
              placeholder="2~50자"
            />
            {errors.userName && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.userName}</p>
            )}
          </div>

          {/* 전화번호 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              전화번호
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => handlePhoneNumberChange(e.target.value)}
              className={`w-full px-4 py-3 border ${
                errors.phoneNumber ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
              } rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none`}
              placeholder="010-1234-5678"
              maxLength={13}
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phoneNumber}</p>
            )}
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
```

### Step 4: 계정 삭제 확인 모달
**파일 생성**: `src/components/mypage/DeleteAccountModal.tsx`

```typescript
import { useState } from 'react';
import { X, AlertCircle, AlertTriangle } from 'lucide-react';
import { deleteAccount } from '../../services/mypageService';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DeleteAccountModal = ({ isOpen, onClose, onSuccess }: DeleteAccountModalProps) => {
  const [confirmText, setConfirmText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (confirmText !== '계정 삭제') {
      setError('정확히 "계정 삭제"를 입력해주세요');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await deleteAccount();
      onSuccess(); // 로그아웃 처리
    } catch (err: any) {
      setError(err.response?.data?.detail || '계정 삭제에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">계정 삭제</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 경고 메시지 */}
        <div className="mb-6 space-y-3">
          <p className="text-slate-700 dark:text-slate-300">
            계정을 삭제하면 다음과 같은 결과가 발생합니다:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li>모든 개인 정보가 삭제됩니다</li>
            <li>작성한 게시글과 댓글은 "탈퇴한 사용자"로 표시됩니다</li>
            <li>북마크 및 활동 내역이 삭제됩니다</li>
            <li>삭제 후 복구할 수 없습니다</li>
          </ul>
        </div>

        {/* 확인 입력 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            계속하려면 <span className="font-bold text-red-600">"계정 삭제"</span>를 입력하세요
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => {
              setConfirmText(e.target.value);
              if (error) setError('');
            }}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
            placeholder="계정 삭제"
          />
          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600"
          >
            취소
          </button>
          <button
            onClick={handleDelete}
            disabled={isLoading || confirmText !== '계정 삭제'}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '삭제 중...' : '계정 삭제'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
```

### Step 5: MyPage에 모달 통합
**파일 수정**: `src/pages/MyPage.tsx`

```typescript
import EditProfileModal from '../components/mypage/EditProfileModal';
import DeleteAccountModal from '../components/mypage/DeleteAccountModal';

const MyPage = () => {
  // ... 기존 상태 ...
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { logout } = useAuthStore();

  // 프로필 수정 성공 핸들러
  const handleProfileUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    // 성공 토스트 메시지 (옵션)
  };

  // 계정 삭제 성공 핸들러
  const handleAccountDelete = async () => {
    await logout();
    navigate('/login', {
      state: { message: '계정이 삭제되었습니다.' }
    });
  };

  return (
    <>
      {/* 기존 MyPage UI */}
      
      {/* 프로필 수정 버튼 수정 */}
      <button
        onClick={() => setIsEditModalOpen(true)}
        className="w-full btn-secondary flex items-center justify-center gap-2"
      >
        <Edit className="w-4 h-4" />
        프로필 수정
      </button>

      {/* 계정 삭제 버튼 추가 (설정 탭 등에) */}
      <button
        onClick={() => setIsDeleteModalOpen(true)}
        className="w-full px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-900/30"
      >
        계정 삭제
      </button>

      {/* 모달들 */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onSuccess={handleProfileUpdate}
      />

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={handleAccountDelete}
      />
    </>
  );
};
```

---

## Partial Update 처리

### 백엔드 동작
```java
// 요청에 포함된 필드만 업데이트
if (request.getUserName() != null) {
    account.setUserName(request.getUserName());
}
if (request.getPhoneNumber() != null) {
    account.setPhoneNumber(request.getPhoneNumber());
}
```

### 프론트엔드 구현
```typescript
// 변경된 필드만 전송
const updateData: Partial<User> = {};

if (userName !== user.userName) {
  updateData.userName = userName;
}

if (phoneNumber !== user.phoneNumber) {
  updateData.phoneNumber = phoneNumber;
}

// 변경사항이 없으면 API 호출 안 함
if (Object.keys(updateData).length === 0) {
  onClose();
  return;
}

await updateProfile(updateData);
```

---

## 테스트 체크리스트

### 프로필 조회
- [ ] 페이지 로드 시 최신 프로필 조회
- [ ] 로딩 상태 표시
- [ ] 401 에러 시 로그인 페이지 이동
- [ ] 404 에러 시 에러 메시지 표시

### 프로필 수정
- [ ] userName만 수정
- [ ] phoneNumber만 수정
- [ ] 둘 다 수정
- [ ] 변경사항 없을 때 API 호출 안 함
- [ ] 전화번호 중복 시 409 에러 표시
- [ ] Validation 실패 시 에러 메시지
- [ ] 수정 성공 시 모달 닫기 및 화면 업데이트

### 계정 삭제
- [ ] 확인 텍스트 일치하지 않으면 삭제 불가
- [ ] "계정 삭제" 정확히 입력 시 삭제 가능
- [ ] 삭제 성공 시 로그아웃 및 로그인 페이지 이동
- [ ] 삭제된 계정으로 재로그인 시도 → 401 에러

---

## UX 개선 제안

### 1. 낙관적 업데이트 (Optimistic Update)
```typescript
// UI 먼저 업데이트
setUser({ ...user, userName: newUserName });

try {
  // API 호출
  await updateProfile({ userName: newUserName });
} catch (error) {
  // 실패 시 롤백
  setUser(originalUser);
}
```

### 2. 토스트 알림
```typescript
// 성공 메시지
toast.success('프로필이 수정되었습니다');

// 에러 메시지
toast.error('프로필 수정에 실패했습니다');
```

### 3. 실시간 Validation
```typescript
// 입력 중 실시간 검증
useEffect(() => {
  if (userName.length > 0 && userName.length < 2) {
    setErrors({ userName: '최소 2자 이상 입력하세요' });
  }
}, [userName]);
```

---

## 참고 문서
- 백엔드 API 명세: `Java/docs/api/03_mypage.md`
- 타입 정의: `src/types/index.ts`
- Validation 유틸: `src/utils/validation.ts`
