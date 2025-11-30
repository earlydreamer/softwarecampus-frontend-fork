# 비밀번호 관리 기능 구현 문서 (프론트엔드)

> 작성일: 2025-11-30  
> 브랜치: `account`

---

## 1. 구현 요약

| 기능 | 컴포넌트 | 경로 | 상태 |
|------|----------|------|------|
| 비밀번호 찾기 | ForgotPasswordPage | `/forgot-password` | ✅ 완료 |
| 비밀번호 변경 | ChangePasswordModal | 마이페이지 모달 | ✅ 완료 |
| 로그인 링크 | LoginPage | `/login` | ✅ 완료 |

---

## 2. 파일 구조

### 2.1 신규 생성
```
src/pages/ForgotPasswordPage.tsx    # 비밀번호 찾기 페이지
```

### 2.2 수정
```
src/App.tsx                                              # 라우트 추가
src/pages/LoginPage.tsx                                  # 비밀번호 찾기 링크 추가
src/pages/MyPage/components/modals/ChangePasswordModal.tsx  # UI 개선
src/pages/MyPage/useMyPage.ts                            # 모달 핸들러 수정
src/services/authService.ts                              # API 함수 추가
```

---

## 3. 비밀번호 찾기 페이지 (`ForgotPasswordPage.tsx`)

### 3.1 경로
- **URL**: `/forgot-password`
- **진입점**: 로그인 페이지 → "비밀번호를 잊으셨나요?" 링크

### 3.2 3단계 흐름

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1: 이메일 입력                                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  📧 이메일 입력                                      │    │
│  │  [user@example.com                              ]   │    │
│  │  [        인증 코드 발송        ]                    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 2: 인증 코드 확인                                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  user@example.com로 인증 코드가 발송되었습니다.       │    │
│  │                                                     │    │
│  │  인증 코드                                           │    │
│  │  [    1   2   3   4   5   6    ]                    │    │
│  │  [          인증 확인          ]                     │    │
│  │         인증 코드 재발송                              │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 3: 새 비밀번호 설정                                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  🔐 새 비밀번호                                      │    │
│  │  [••••••••••••                                  ]   │    │
│  │                                                     │    │
│  │  🔐 비밀번호 확인                                    │    │
│  │  [••••••••••••                                  ]   │    │
│  │  [         비밀번호 변경         ]                   │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 4: 완료                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              ✅                                      │    │
│  │      비밀번호 변경 완료                               │    │
│  │  새로운 비밀번호로 로그인해주세요.                     │    │
│  │  [          로그인하기          ]                    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 사용 API

| 단계 | API | 설명 |
|------|-----|------|
| Step 1 | `POST /api/auth/email/send-reset-code` | 인증 코드 발송 |
| Step 2 | `POST /api/auth/email/verify-reset` | 인증 코드 확인 |
| Step 3 | `POST /api/auth/reset-password` | 비밀번호 재설정 |

### 3.4 UI 특징
- 진행 상태 표시 (1 → 2 → 3 단계 인디케이터)
- 이메일/비밀번호 입력 필드에 아이콘 (Mail, KeyRound)
- 인증 코드 입력 시 중앙 정렬 + 넓은 자간
- 완료 시 체크 아이콘과 성공 메시지
- "로그인으로 돌아가기" 링크

---

## 4. 비밀번호 변경 모달 (`ChangePasswordModal.tsx`)

### 4.1 진입점
- **위치**: 마이페이지 → 프로필 수정 → "비밀번호 변경" 버튼
- **상태**: 로그인 필수

### 4.2 3단계 흐름 (이중 인증)

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1: 현재 비밀번호 확인                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  🔐 현재 비밀번호                                    │    │
│  │  [••••••••••••                                  ]   │    │
│  │  [   📧 이메일 인증   ]                              │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 2: 이메일 인증 코드 입력                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  user@example.com로 인증 코드가 발송되었습니다.       │    │
│  │                                                     │    │
│  │  인증 코드                                           │    │
│  │  [    1   2   3   4   5   6    ]                    │    │
│  │  [          다음          ]                         │    │
│  │         인증 코드 재발송                              │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 3: 새 비밀번호 설정                                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  🔐 새 비밀번호                                      │    │
│  │  [••••••••••••                                  ]   │    │
│  │                                                     │    │
│  │  🔐 비밀번호 확인                                    │    │
│  │  [••••••••••••                                  ]   │    │
│  │  [       비밀번호 변경       ]                       │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 사용 API

| 단계 | API | 설명 |
|------|-----|------|
| Step 1 | `POST /api/auth/verify-password` | 현재 비밀번호 확인 |
| Step 1 → 2 | `POST /api/auth/email/send-change-code` | 인증 코드 발송 |
| Step 3 | `PUT /api/mypage/password` | 비밀번호 변경 |

### 4.4 보안 특징 (이중 인증)
1. **현재 비밀번호 확인** - 세션 탈취 방어
2. **이메일 인증 코드** - 본인 확인 강화

---

## 5. API 서비스 (`authService.ts`)

### 5.1 비밀번호 찾기용 API
```typescript
// 인증 코드 발송
export const sendPasswordResetCode = async (email: string) => {
    const response = await apiClient.post('/api/auth/email/send-reset-code', { email });
    return response.data;
};

// 인증 코드 확인
export const verifyPasswordResetCode = async (email: string, code: string) => {
    const response = await apiClient.post('/api/auth/email/verify-reset', { email, code });
    return response.data;
};
```

### 5.2 비밀번호 변경용 API (로그인 상태)
```typescript
// Step 1: 현재 비밀번호 확인
export const verifyCurrentPassword = async (currentPassword: string) => {
    const response = await apiClient.post('/api/auth/verify-password', { currentPassword });
    return response.data;
};

// Step 2: 이메일 인증 코드 발송
export const sendPasswordChangeCode = async (email: string) => {
    const response = await apiClient.post('/api/auth/email/send-change-code', { email });
    return response.data;
};

// Step 3: 비밀번호 변경
export const changePassword = async (verificationCode: string, newPassword: string) => {
    await apiClient.put('/api/mypage/password', { code: verificationCode, newPassword });
};
```

---

## 6. 라우팅 (`App.tsx`)

```tsx
// Auth 라우트
<Route path="/login" element={<LoginPage />} />
<Route path="/signup" element={<SignupPage />} />
<Route path="/forgot-password" element={<ForgotPasswordPage />} />  // 추가됨
<Route path="/mypage" element={<MyPage />} />
```

---

## 7. 로그인 페이지 링크 (`LoginPage.tsx`)

```tsx
<div className="mt-6 text-center space-y-2">
    <p className="text-sm text-slate-500 dark:text-slate-400">
        계정이 없으신가요? <Link to="/signup">회원가입</Link>
    </p>
    <p className="text-sm text-slate-500 dark:text-slate-400">
        비밀번호를 잊으셨나요? <Link to="/forgot-password">비밀번호 찾기</Link>
    </p>
</div>
```

---

## 8. 비밀번호 규칙 (프론트엔드 검증)

| 규칙 | 값 |
|------|-----|
| 최소 길이 | 8자 |
| 최대 길이 | 20자 |
| 필수 포함 | 영문, 숫자, 특수문자 |

```tsx
// 프론트엔드 검증 예시
if (newPassword.length < 8) {
    setError('비밀번호는 8자 이상이어야 합니다.');
    return;
}

if (newPassword !== confirmPassword) {
    setError('비밀번호가 일치하지 않습니다.');
    return;
}
```

---

## 9. 에러 처리

### 9.1 공통 에러 UI
```tsx
{error && (
    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 
                    dark:border-red-800 rounded-lg flex items-center gap-2 
                    text-red-700 dark:text-red-400 text-sm">
        <AlertCircle className="w-4 h-4" />
        <span>{error}</span>
    </div>
)}
```

### 9.2 에러 메시지
| 상황 | 메시지 |
|------|--------|
| 인증 코드 불일치 | "인증 코드가 올바르지 않습니다." |
| 인증 코드 만료 | "인증 코드가 만료되었습니다." |
| 비밀번호 불일치 | "비밀번호가 일치하지 않습니다." |
| 비밀번호 규칙 위반 | "비밀번호는 8자 이상이어야 합니다." |
| 서버 오류 | "비밀번호 변경에 실패했습니다." |

---

## 10. 완료 상태

- ✅ 비밀번호 찾기 페이지 구현
- ✅ 비밀번호 변경 모달 개선
- ✅ API 서비스 함수 추가
- ✅ 라우팅 설정
- ✅ 로그인 페이지 링크 추가
- ✅ 에러 처리
- ⏳ 통합 테스트 진행 중
