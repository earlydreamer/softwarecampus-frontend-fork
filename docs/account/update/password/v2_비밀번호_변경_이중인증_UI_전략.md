# 비밀번호 변경 이중 인증 UI - v2 전략 설계

> 작성일: 2025-11-30  
> 브랜치: `account`  
> 버전: v2 (이중 인증 방식)  
> 의존성: 백엔드 v2 API 구현 완료 필요

---

## 1. 개요

### 1.1 목적
마이페이지에서 **3단계 비밀번호 변경 플로우** UI 구현

### 1.2 사전 조건
- ✅ 백엔드 API 구현 완료
  - `POST /api/auth/verify-password`
  - `POST /api/auth/email/send-change-code`
  - `PUT /api/mypage/password` (PASSWORD_CHANGE 지원)

### 1.3 플로우 요약

```
Step 1: 현재 비밀번호 확인  →  Step 2: 이메일 인증  →  Step 3: 새 비밀번호 설정
        ┌─────────────┐         ┌─────────────┐         ┌─────────────┐
        │   🔒 입력   │ ──────► │   ✉️ 코드   │ ──────► │   🔐 변경   │
        └─────────────┘         └─────────────┘         └─────────────┘
```

---

## 2. 사용자 플로우 (UX)

### 2.1 Step 1: 현재 비밀번호 확인

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│   🔒 본인 확인                                            │
│                                                           │
│   비밀번호를 변경하려면 현재 비밀번호를 입력해주세요.       │
│                                                           │
│   현재 비밀번호                                           │
│   ┌─────────────────────────────────────────┐            │
│   │ ••••••••••••                            │ 👁         │
│   └─────────────────────────────────────────┘            │
│   ❌ 현재 비밀번호가 일치하지 않습니다. (에러 시)         │
│                                                           │
│              [취소]  [다음]                               │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

**API 호출:**
```typescript
POST /api/auth/verify-password
{ "currentPassword": "입력값" }
```

**성공 시:** Step 2로 이동 + 자동으로 이메일 발송
**실패 시:** 에러 메시지 표시, Step 1 유지

---

### 2.2 Step 2: 이메일 인증

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│   ✉️ 이메일 인증                                          │
│                                                           │
│   user***@example.com으로 인증 코드를 발송했습니다.       │
│   (3분 내 입력해주세요)                                   │
│                                                           │
│   인증 코드                                               │
│   ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐                         │
│   │  │ │  │ │  │ │  │ │  │ │  │                         │
│   └──┘ └──┘ └──┘ └──┘ └──┘ └──┘                         │
│                                                           │
│   ⏱️ 2:45 남음          [재발송]                          │
│                                                           │
│              [취소]  [다음]                               │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

**API 호출 (재발송 시):**
```typescript
POST /api/auth/email/send-change-code
// body 없음, JWT에서 이메일 추출
```

**다음 클릭 시:** Step 3로 이동 (코드는 Step 3에서 최종 검증)

---

### 2.3 Step 3: 새 비밀번호 설정

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│   🔐 새 비밀번호 설정                                     │
│                                                           │
│   새 비밀번호                                             │
│   ┌─────────────────────────────────────────┐            │
│   │ ••••••••••••                            │ 👁         │
│   └─────────────────────────────────────────┘            │
│   ✓ 8자 이상  ✓ 영문  ✓ 숫자  ✓ 특수문자                 │
│                                                           │
│   새 비밀번호 확인                                        │
│   ┌─────────────────────────────────────────┐            │
│   │ ••••••••••••                            │ 👁         │
│   └─────────────────────────────────────────┘            │
│   ✓ 비밀번호 일치                                        │
│                                                           │
│              [취소]  [변경 완료]                           │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

**API 호출:**
```typescript
PUT /api/mypage/password
{ "code": "123456", "newPassword": "새비밀번호" }
```

**성공 시:** 완료 모달 표시 → 모달 닫기
**실패 시:** 에러 메시지 표시 (코드 만료 시 Step 2로 이동)

---

## 3. 컴포넌트 구조

### 3.1 파일 구조

```
src/
├── components/
│   └── mypage/
│       └── PasswordChangeModal.tsx     ← 📝 신규/수정
├── services/
│   └── api/
│       └── authService.ts              ← 📝 수정 (API 함수 추가)
└── pages/
    └── MyPage/
        └── MyPage.tsx                  ← 모달 연결
```

### 3.2 상태 관리

```typescript
interface PasswordChangeState {
  step: 1 | 2 | 3;                  // 현재 단계
  currentPassword: string;          // Step 1 입력값
  verificationCode: string;         // Step 2 입력값
  newPassword: string;              // Step 3 입력값
  confirmPassword: string;          // Step 3 확인값
  timer: number;                    // 인증 코드 만료 타이머 (초)
  isLoading: boolean;               // API 호출 중
  error: string | null;             // 에러 메시지
}
```

---

## 4. API 서비스 함수

### 4.1 authService.ts 수정

```typescript
// src/services/api/authService.ts

/**
 * Step 1: 현재 비밀번호 확인
 */
export const verifyCurrentPassword = async (currentPassword: string) => {
  const response = await apiClient.post('/api/auth/verify-password', {
    currentPassword
  });
  return response.data;
};

/**
 * Step 2: 비밀번호 변경용 이메일 인증 코드 발송
 */
export const sendPasswordChangeCode = async () => {
  const response = await apiClient.post('/api/auth/email/send-change-code');
  return response.data;
};

/**
 * Step 3: 최종 비밀번호 변경
 */
export const changePassword = async (code: string, newPassword: string) => {
  const response = await apiClient.put('/api/mypage/password', {
    code,
    newPassword
  });
  return response.data;
};
```

---

## 5. 컴포넌트 구현 가이드

### 5.1 PasswordChangeModal.tsx

```tsx
import React, { useState, useEffect } from 'react';
import { verifyCurrentPassword, sendPasswordChangeCode, changePassword } from '@/services/api/authService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export const PasswordChangeModal: React.FC<Props> = ({ isOpen, onClose, userEmail }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [currentPassword, setCurrentPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [timer, setTimer] = useState(180);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: 현재 비밀번호 확인
  const handleVerifyPassword = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await verifyCurrentPassword(currentPassword);
      // 성공 시 바로 이메일 발송
      await sendPasswordChangeCode();
      setTimer(180);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || '비밀번호 확인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: 재발송
  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      await sendPasswordChangeCode();
      setTimer(180);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || '재발송에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: 비밀번호 변경
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await changePassword(verificationCode, newPassword);
      alert('비밀번호가 성공적으로 변경되었습니다.');
      handleClose();
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.response?.data?.message;
      if (msg?.includes('만료')) {
        setStep(2);
        setTimer(0);
      }
      setError(msg || '비밀번호 변경에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 타이머
  useEffect(() => {
    if (step === 2 && timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  // 모달 닫기 시 초기화
  const handleClose = () => {
    setStep(1);
    setCurrentPassword('');
    setVerificationCode('');
    setNewPassword('');
    setConfirmPassword('');
    setTimer(180);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    // ... UI 렌더링
  );
};
```

---

## 6. 에러 핸들링

| API | HTTP 상태 | 에러 메시지 | UI 처리 |
|-----|----------|------------|---------|
| `verify-password` | 400 | "현재 비밀번호가 일치하지 않습니다." | 입력창 흔들기 + 에러 표시 |
| `send-change-code` | 429 | "잠시 후 다시 시도해주세요." | 재발송 버튼 비활성화 |
| `password` | 400 | "인증 코드가 일치하지 않습니다." | 코드 입력창 클리어 |
| `password` | 400 | "인증 코드가 만료되었습니다." | Step 2로 이동, 재발송 안내 |
| `password` | 429 | "최대 시도 횟수를 초과했습니다." | 모달 닫기 + 30분 후 안내 |

---

## 7. 비밀번호 규칙

### 7.1 유효성 검사 (프론트엔드)

```typescript
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+\[\]{}|;:'",.<>/?~])[A-Za-z\d!@#$%^&*()\-_=+\[\]{}|;:'",.<>/?~]{8,20}$/;
```

### 7.2 강도 표시 컴포넌트

```tsx
const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  const checks = {
    length: password.length >= 8 && password.length <= 20,
    letter: /[A-Za-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()\-_=+\[\]{}|;:'",.<>/?~]/.test(password),
  };

  return (
    <div className="flex gap-2 text-sm mt-1">
      <span className={checks.length ? 'text-green-500' : 'text-gray-400'}>✓ 8~20자</span>
      <span className={checks.letter ? 'text-green-500' : 'text-gray-400'}>✓ 영문</span>
      <span className={checks.number ? 'text-green-500' : 'text-gray-400'}>✓ 숫자</span>
      <span className={checks.special ? 'text-green-500' : 'text-gray-400'}>✓ 특수문자</span>
    </div>
  );
};
```

---

## 8. 체크리스트

### 구현 전 (백엔드 의존)
- [ ] `POST /api/auth/verify-password` API 확인
- [ ] `POST /api/auth/email/send-change-code` API 확인
- [ ] `PUT /api/mypage/password` (PASSWORD_CHANGE) API 확인

### 구현 중
- [ ] `authService.ts`에 API 함수 3개 추가
- [ ] `PasswordChangeModal.tsx` 3단계 플로우 구현
- [ ] 타이머 로직 (3분 카운트다운)
- [ ] 비밀번호 강도 표시
- [ ] 에러 핸들링

### 구현 후
- [ ] 정상 플로우 테스트
- [ ] 에러 케이스 테스트
- [ ] 모바일 반응형 확인

---

## 9. 참고 문서

- 백엔드 v2 전략: `softwarecampus-backend/.md/account/프로젝트 작업 지침/update/password/v2_비밀번호_변경_이중인증_전략.md`
- 기존 Phase 3 가이드: `docs/account/mypage/phase/03_Phase3_비밀번호_이중인증_구현가이드.md`

---

**작성일:** 2025년 11월 30일  
**작성자:** GitHub Copilot  
**문서 버전:** 2.0  
**상태:** 백엔드 API 대기 중
