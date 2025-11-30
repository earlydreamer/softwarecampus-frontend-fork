# Phase 3: 비밀번호 변경 이중 인증 UI 구현 가이드

**작성일**: 2025년 11월 30일  
**작성자**: GitHub Copilot  
**상태**: 설계 완료, 구현 대기

---

## 1. 개요

본 문서는 마이페이지의 **비밀번호 변경 기능**을 **이중 인증 방식**으로 업그레이드하기 위한 프론트엔드 구현 가이드입니다.

### 변경 전후 비교

| 구분 | Phase 2 (기존) | Phase 3 (신규) |
|------|----------------|----------------|
| **보안 수준** | 낮음 | 높음 (이중 인증) |
| **인증 단계** | 1단계 | 3단계 |
| **플로우** | 새 비번 입력 → 즉시 변경 | 현재 비번 확인 → 이메일 인증 → 새 비번 변경 |
| **방어** | 없음 | 세션 탈취 공격 방어 |

---

## 2. 사용자 플로우 (UX)

```
┌─────────────────────────────────────────────────────────────────┐
│                        마이페이지                                │
│                                                                 │
│  [프로필 편집]  [비밀번호 변경]  [계정 삭제]                      │
│                      ↓ 클릭                                     │
└─────────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│              Step 1: 현재 비밀번호 확인                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │   🔒 본인 확인                                            │  │
│  │                                                           │  │
│  │   비밀번호를 변경하려면 현재 비밀번호를 입력해주세요.       │  │
│  │                                                           │  │
│  │   현재 비밀번호                                           │  │
│  │   ┌─────────────────────────────────────────┐            │  │
│  │   │ ••••••••••••                            │ 👁         │  │
│  │   └─────────────────────────────────────────┘            │  │
│  │                                                           │  │
│  │              [취소]  [확인]                                │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                       │ 성공
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│              Step 2: 이메일 인증                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │   ✉️ 이메일 인증                                          │  │
│  │                                                           │  │
│  │   user@example.com으로 인증 코드를 발송했습니다.           │  │
│  │   (3분 내 입력해주세요)                                   │  │
│  │                                                           │  │
│  │   인증 코드                                               │  │
│  │   ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐                         │  │
│  │   │1 │ │2 │ │3 │ │4 │ │5 │ │6 │                         │  │
│  │   └──┘ └──┘ └──┘ └──┘ └──┘ └──┘                         │  │
│  │                                                           │  │
│  │   ⏱️ 2:45 남음          [재발송]                          │  │
│  │                                                           │  │
│  │              [취소]  [확인]                                │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                       │ 성공
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│              Step 3: 새 비밀번호 설정                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │   🔐 새 비밀번호 설정                                     │  │
│  │                                                           │  │
│  │   새 비밀번호                                             │  │
│  │   ┌─────────────────────────────────────────┐            │  │
│  │   │ ••••••••••••                            │ 👁         │  │
│  │   └─────────────────────────────────────────┘            │  │
│  │   ✓ 8자 이상  ✓ 영문  ✓ 숫자  ✓ 특수문자                 │  │
│  │                                                           │  │
│  │   새 비밀번호 확인                                        │  │
│  │   ┌─────────────────────────────────────────┐            │  │
│  │   │ ••••••••••••                            │ 👁         │  │
│  │   └─────────────────────────────────────────┘            │  │
│  │   ✓ 비밀번호 일치                                        │  │
│  │                                                           │  │
│  │              [취소]  [변경 완료]                           │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                       │ 성공
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│              완료                                                │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │   ✅ 비밀번호 변경 완료                                   │  │
│  │                                                           │  │
│  │   비밀번호가 성공적으로 변경되었습니다.                    │  │
│  │                                                           │  │
│  │                    [확인]                                 │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. 컴포넌트 구조

### 3.1 파일 구조

```
src/
├── components/auth/
│   └── ChangePasswordModal.tsx     ← 📝 수정 (3단계 플로우로 변경)
├── pages/MyPage/
│   ├── MyPage.tsx
│   └── components/
│       └── modals/
│           └── PasswordChangeFlow.tsx  ← 🆕 신규 (선택사항)
└── services/
    └── authService.ts              ← 📝 수정 (verifyPassword API 추가)
```

### 3.2 상태 관리

```typescript
// ChangePasswordModal 내부 상태
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

## 4. API 연동

### 4.1 서비스 함수 추가 (`authService.ts`)

```typescript
// src/services/authService.ts

/**
 * Step 1: 현재 비밀번호 검증
 */
export const verifyCurrentPassword = async (currentPassword: string): Promise<{
  verified: boolean;
  message: string;
}> => {
  const response = await api.post('/api/auth/verify-password', {
    currentPassword
  });
  return response.data;
};

/**
 * Step 2: 비밀번호 변경용 이메일 인증 코드 발송
 */
export const sendPasswordChangeCode = async (email: string): Promise<{
  success: boolean;
  message: string;
  expiresAt: string;
}> => {
  const response = await api.post('/api/auth/email/send-change-code', {
    email
  });
  return response.data;
};

/**
 * Step 3: 최종 비밀번호 변경
 */
export const changePassword = async (data: {
  verificationCode: string;
  newPassword: string;
}): Promise<{
  message: string;
}> => {
  const response = await api.put('/api/mypage/password', data);
  return response.data;
};
```

### 4.2 에러 핸들링

| API | HTTP 상태 | 에러 메시지 | UI 처리 |
|-----|----------|------------|---------|
| `verify-password` | 400 | "현재 비밀번호가 일치하지 않습니다." | 입력창 흔들기 + 에러 표시 |
| `send-change-code` | 429 | "재발송 대기 시간입니다." | 재발송 버튼 비활성화 |
| `password` | 400 | "인증 코드가 일치하지 않습니다." | 코드 입력창 클리어 + 에러 표시 |
| `password` | 400 | "인증 코드가 만료되었습니다." | Step 2로 이동, 재발송 안내 |
| `password` | 429 | "최대 시도 횟수를 초과했습니다." | 모달 닫기 + 30분 후 재시도 안내 |

---

## 5. 구현 상세

### 5.1 ChangePasswordModal 컴포넌트 (수정)

```tsx
// src/components/auth/ChangePasswordModal.tsx

import React, { useState, useEffect } from 'react';
import { verifyCurrentPassword, sendPasswordChangeCode, changePassword } from '@/services/authService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export const ChangePasswordModal: React.FC<Props> = ({ isOpen, onClose, userEmail }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [currentPassword, setCurrentPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [timer, setTimer] = useState(180); // 3분
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 타이머 로직
  useEffect(() => {
    if (step === 2 && timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  // Step 1: 현재 비밀번호 확인
  const handleVerifyPassword = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await verifyCurrentPassword(currentPassword);
      // 성공 시 즉시 이메일 인증 코드 발송
      await sendPasswordChangeCode(userEmail);
      setTimer(180);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.detail || '비밀번호 확인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: 인증 코드 재발송
  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      await sendPasswordChangeCode(userEmail);
      setTimer(180);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || '재발송에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 → Step 3 진행 (코드 입력 후)
  const handleVerifyCode = () => {
    if (verificationCode.length === 6) {
      setStep(3);
      setError(null);
    }
  };

  // Step 3: 최종 비밀번호 변경
  const handleChangePassword = async () => {
    // 프론트엔드 검증
    if (newPassword !== confirmPassword) {
      setError('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await changePassword({ verificationCode, newPassword });
      alert('비밀번호가 성공적으로 변경되었습니다.');
      onClose();
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail;
      if (errorMsg?.includes('만료')) {
        setStep(2);
        setTimer(0);
      }
      setError(errorMsg || '비밀번호 변경에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 모달 닫기 시 상태 초기화
  const handleClose = () => {
    setStep(1);
    setCurrentPassword('');
    setVerificationCode('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Step 1: 현재 비밀번호 확인 */}
        {step === 1 && (
          <>
            <h2>🔒 본인 확인</h2>
            <p>비밀번호를 변경하려면 현재 비밀번호를 입력해주세요.</p>
            <input
              type="password"
              placeholder="현재 비밀번호"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            {error && <p className="error">{error}</p>}
            <div className="button-group">
              <button onClick={handleClose}>취소</button>
              <button onClick={handleVerifyPassword} disabled={isLoading || !currentPassword}>
                {isLoading ? '확인 중...' : '확인'}
              </button>
            </div>
          </>
        )}

        {/* Step 2: 이메일 인증 */}
        {step === 2 && (
          <>
            <h2>✉️ 이메일 인증</h2>
            <p>{userEmail}으로 인증 코드를 발송했습니다.</p>
            <p>⏱️ {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')} 남음</p>
            <input
              type="text"
              placeholder="6자리 인증 코드"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
            />
            <button onClick={handleResendCode} disabled={timer > 0 || isLoading}>
              재발송
            </button>
            {error && <p className="error">{error}</p>}
            <div className="button-group">
              <button onClick={handleClose}>취소</button>
              <button onClick={handleVerifyCode} disabled={verificationCode.length !== 6}>
                확인
              </button>
            </div>
          </>
        )}

        {/* Step 3: 새 비밀번호 설정 */}
        {step === 3 && (
          <>
            <h2>🔐 새 비밀번호 설정</h2>
            <input
              type="password"
              placeholder="새 비밀번호"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <PasswordStrengthIndicator password={newPassword} />
            <input
              type="password"
              placeholder="새 비밀번호 확인"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="error">비밀번호가 일치하지 않습니다.</p>
            )}
            {error && <p className="error">{error}</p>}
            <div className="button-group">
              <button onClick={handleClose}>취소</button>
              <button 
                onClick={handleChangePassword} 
                disabled={isLoading || !newPassword || newPassword !== confirmPassword}
              >
                {isLoading ? '변경 중...' : '변경 완료'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// 비밀번호 강도 표시 컴포넌트
const PasswordStrengthIndicator: React.FC<{ password: string }> = ({ password }) => {
  const checks = {
    length: password.length >= 8,
    letter: /[A-Za-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{}|;:'",.<>?/]/.test(password),
  };

  return (
    <div className="password-checks">
      <span className={checks.length ? 'valid' : ''}>✓ 8자 이상</span>
      <span className={checks.letter ? 'valid' : ''}>✓ 영문</span>
      <span className={checks.number ? 'valid' : ''}>✓ 숫자</span>
      <span className={checks.special ? 'valid' : ''}>✓ 특수문자</span>
    </div>
  );
};
```

---

## 6. 스타일링 가이드

### 6.1 Tailwind CSS 클래스 참고

```tsx
// Step Indicator (상단 진행 표시)
<div className="flex justify-center mb-6">
  <div className={`w-8 h-8 rounded-full ${step >= 1 ? 'bg-blue-500' : 'bg-gray-300'}`}>1</div>
  <div className="w-16 h-1 bg-gray-300 self-center" />
  <div className={`w-8 h-8 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-gray-300'}`}>2</div>
  <div className="w-16 h-1 bg-gray-300 self-center" />
  <div className={`w-8 h-8 rounded-full ${step >= 3 ? 'bg-blue-500' : 'bg-gray-300'}`}>3</div>
</div>

// 에러 메시지
<p className="text-red-500 text-sm mt-1">{error}</p>

// 비밀번호 강도 체크
<span className={checks.length ? 'text-green-500' : 'text-gray-400'}>✓ 8자 이상</span>
```

---

## 7. 테스트 시나리오

### 7.1 정상 플로우
1. [비밀번호 변경] 버튼 클릭
2. 현재 비밀번호 입력 → [확인] 클릭
3. 이메일로 인증 코드 수신
4. 인증 코드 6자리 입력 → [확인] 클릭
5. 새 비밀번호 + 확인 입력 → [변경 완료] 클릭
6. "비밀번호가 성공적으로 변경되었습니다." 확인

### 7.2 에러 케이스
| 케이스 | 예상 동작 |
|--------|-----------|
| Step 1: 현재 비밀번호 틀림 | 에러 메시지 표시, Step 1 유지 |
| Step 2: 인증 코드 틀림 | Step 3에서 에러 표시, 코드 클리어 |
| Step 2: 인증 코드 만료 | Step 2로 이동, 타이머 0, 재발송 버튼 활성화 |
| Step 2: 5회 실패 | 모달 닫기, "30분 후 재시도" 알림 |
| Step 3: 비밀번호 불일치 | 실시간 에러 표시 (프론트 검증) |
| Step 3: 비밀번호 규칙 위반 | 서버 에러 메시지 표시 |

---

## 8. 체크리스트

### 구현 전
- [ ] Backend API 구현 완료 확인
- [ ] API 응답 스펙 확인

### 구현 중
- [ ] `authService.ts`에 API 함수 추가
- [ ] `ChangePasswordModal.tsx` 3단계 플로우로 수정
- [ ] 타이머 로직 구현 (3분 카운트다운)
- [ ] 비밀번호 강도 표시 컴포넌트 구현
- [ ] 에러 핸들링 구현

### 구현 후
- [ ] 정상 플로우 테스트
- [ ] 에러 케이스 테스트
- [ ] 모바일 반응형 확인
- [ ] 접근성(a11y) 확인

---

## 9. 참고 문서

- Backend 전략 설계: `softwarecampus-backend/.md/account/프로젝트 작업 지침/update/password/02_이중인증_비밀번호_변경_전략.md`
- Phase 2 완료 보고서: `docs/account/mypage/phase/02_Phase2_기능연동_및_고도화_완료.md`

---

**작성일:** 2025년 11월 30일  
**작성자:** GitHub Copilot  
**문서 버전:** 1.0  
**상태:** 설계 완료, 구현 대기
