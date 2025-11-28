# 회원가입 프론트엔드 구현 가이드

## 현재 코드 현황

### 파일 위치
- **메인 컴포넌트**: `src/pages/SignupPage.tsx`
- **타입 정의**: `src/types/index.ts` (SignupFormData)
- **Validation**: `src/utils/validation.ts`
- **모달**: `src/components/auth/AcademySelectModal.tsx`

### 현재 구현된 기능

#### 1. 폼 필드 (SignupFormData)
```typescript
interface SignupFormData {
    email: string;                    // ✅ 구현됨
    password: string;                 // ✅ 구현됨
    userName: string;                 // ✅ 구현됨
    phoneNumber: string;              // ✅ 구현됨
    address: string | null;           // ✅ 구현됨 (선택)
    affiliation: string | null;       // ✅ 구현됨 (선택)
    position: string | null;          // ✅ 구현됨 (선택)
    accountType: AccountType;         // ✅ 구현됨 (USER/ACADEMY)
    academyId: number | null;         // ✅ 구현됨 (ACADEMY만)
}
```

#### 2. 탭 구분
- ✅ 일반회원(USER) / 기관회원(ACADEMY) 탭
- ✅ 탭 전환 시 폼 초기화
- ✅ ACADEMY 탭에서 기관 선택 모달

#### 3. Validation
- ✅ 이메일 형식 검증
- ✅ 비밀번호 형식 검증 (8~20자, 영문+숫자+특수문자)
- ✅ 비밀번호 확인 일치 검증
- ✅ 전화번호 형식 검증 (010-XXXX-XXXX)
- ✅ 사용자명 길이 검증 (2~50자)
- ✅ ACADEMY 계정 기관 선택 필수 검증

#### 4. UI/UX
- ✅ 비밀번호 표시/숨김 토글
- ✅ 실시간 에러 메시지 표시
- ✅ 비밀번호 확인 일치 시 체크 아이콘
- ✅ 전화번호 자동 하이픈 삽입
- ✅ 제출 중 버튼 비활성화

### 현재 동작 방식
```typescript
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ... validation ...
    
    try {
        console.log('회원가입 데이터:', formData);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        navigate('/login', {
            state: { message: '회원가입이 완료되었습니다! 로그인해주세요.' }
        });
    } catch (error) {
        // 에러 처리
    }
};
```
⚠️ **문제점**: 실제 API 호출 없이 Mock으로만 동작

---

## 백엔드 API 요구사항

### 회원가입 플로우 (백엔드 요구사항)
```
1. 이메일 인증 코드 발송     POST /api/auth/email/send-verification
2. 인증 코드 검증           POST /api/auth/email/verify
3. (선택) 이메일 중복 확인   GET /api/auth/check-email?email=xxx
4. 회원가입 요청           POST /api/auth/signup
```

### API 상세

#### 1️⃣ 이메일 인증 코드 발송
**Endpoint**: `POST /api/auth/email/send-verification`

**Request**:
```typescript
{
  email: string;
}
```

**Response (200)**:
```typescript
{
  success: boolean;
  message: string;              // "인증 코드가 이메일로 발송되었습니다."
  expiresIn: number;            // 180 (초)
}
```

**에러**:
- 400: 이메일 형식 오류
- 429: 재발송 제한 (60초 쿨다운)

#### 2️⃣ 인증 코드 검증
**Endpoint**: `POST /api/auth/email/verify`

**Request**:
```typescript
{
  email: string;
  code: string;                 // 6자리 숫자
}
```

**Response (200)**:
```typescript
{
  success: boolean;
  message: string;              // "이메일 인증이 완료되었습니다."
  verified: boolean;            // true
}
```

**에러**:
- 400: 잘못된 인증 코드
- 410: 만료된 인증 코드 (3분 경과)
- 403: 인증 시도 5회 초과 (30분 차단)

#### 3️⃣ 이메일 중복 확인
**Endpoint**: `GET /api/auth/check-email?email={email}`

**Response (200)**:
```typescript
{
  available: boolean;           // true: 사용 가능, false: 중복
  message: string;
}
```

#### 4️⃣ 회원가입
**Endpoint**: `POST /api/auth/signup`

**Request**:
```typescript
{
  email: string;
  password: string;
  userName: string;
  phoneNumber: string;
  address: string | null;
  affiliation: string | null;
  position: string | null;
  accountType: "USER" | "ACADEMY";
  academyId: number | null;
}
```

**Response (201)**:
```typescript
{
  id: number;
  email: string;
  userName: string;
  phoneNumber: string;
  accountType: "USER" | "ACADEMY";
  approvalStatus: "APPROVED" | "PENDING";
  address: string | null;
  affiliation: string | null;
  position: string | null;
}
```

**에러**:
- 400: 이메일 인증 미완료 ⚠️ **중요**
- 400: Validation 실패
- 409: 이메일 중복
- 409: 전화번호 중복

---

## 누락된 기능 및 구현 필요 사항

### ❌ 1. 이메일 인증 UI
**현재**: 없음  
**필요**:
- 이메일 입력 후 "인증 코드 발송" 버튼
- 인증 코드 6자리 입력 필드
- 인증 완료 상태 표시
- 재발송 버튼 (60초 쿨다운 타이머)
- 인증 시간 만료 카운트다운 (3분)

### ❌ 2. 이메일 중복 체크 버튼
**현재**: 없음  
**필요**:
- 이메일 입력 필드 옆에 "중복 확인" 버튼
- 중복 확인 완료 상태 표시

### ❌ 3. 상태 관리
**필요한 상태**:
```typescript
const [emailVerified, setEmailVerified] = useState(false);           // 인증 완료 여부
const [verificationCode, setVerificationCode] = useState('');        // 입력한 코드
const [codeSent, setCodeSent] = useState(false);                     // 코드 발송 여부
const [resendCooldown, setResendCooldown] = useState(0);            // 재발송 쿨다운 (초)
const [verifyExpiry, setVerifyExpiry] = useState(0);                // 인증 만료 시간 (초)
const [emailChecked, setEmailChecked] = useState(false);            // 중복 확인 여부
```

### ❌ 4. API Service 함수
**필요한 함수** (`src/services/authService.ts`):
```typescript
// 이메일 인증 코드 발송
async function sendVerificationCode(email: string): Promise<void>

// 인증 코드 검증
async function verifyCode(email: string, code: string): Promise<boolean>

// 이메일 중복 확인
async function checkEmailAvailability(email: string): Promise<boolean>

// 회원가입
async function signup(data: SignupFormData): Promise<User>
```

### ❌ 5. 에러 처리
**필요한 처리**:
- RFC 7807 Problem Details 파싱
- 각 API별 에러 메시지 매핑
- 사용자 친화적 에러 메시지 표시

---

## 개조 계획

### Step 1: API Service 계층 구축
**파일 생성**: `src/services/authService.ts`

```typescript
import axios from 'axios';
import type { SignupFormData, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 이메일 인증 코드 발송
export async function sendVerificationCode(email: string) {
  const response = await api.post('/api/auth/email/send-verification', { email });
  return response.data;
}

// 인증 코드 검증
export async function verifyCode(email: string, code: string) {
  const response = await api.post('/api/auth/email/verify', { email, code });
  return response.data;
}

// 이메일 중복 확인
export async function checkEmailAvailability(email: string) {
  const response = await api.get('/api/auth/check-email', { params: { email } });
  return response.data;
}

// 회원가입
export async function signup(data: SignupFormData): Promise<User> {
  const response = await api.post('/api/auth/signup', data);
  return response.data;
}
```

### Step 2: 이메일 인증 UI 추가
**위치**: `SignupPage.tsx` 이메일 필드 섹션

**추가할 UI 요소**:
1. 이메일 입력 필드 + "인증 코드 발송" 버튼
2. 인증 코드 6자리 입력 필드 (코드 발송 후 표시)
3. "인증 확인" 버튼
4. 재발송 버튼 (60초 쿨다운)
5. 인증 만료 카운트다운 (3분)
6. 인증 완료 체크 아이콘

### Step 3: 상태 관리 로직 구현
```typescript
// 인증 코드 발송
const handleSendCode = async () => {
  if (!isValidEmail(formData.email)) {
    setErrors(prev => ({ ...prev, email: '유효한 이메일을 입력하세요' }));
    return;
  }
  
  try {
    await sendVerificationCode(formData.email);
    setCodeSent(true);
    setResendCooldown(60);
    setVerifyExpiry(180);
    // 타이머 시작
  } catch (error) {
    // 에러 처리
  }
};

// 인증 코드 검증
const handleVerifyCode = async () => {
  try {
    const result = await verifyCode(formData.email, verificationCode);
    if (result.verified) {
      setEmailVerified(true);
    }
  } catch (error) {
    // 에러 처리
  }
};
```

### Step 4: 이메일 중복 확인 버튼
```typescript
const handleCheckEmail = async () => {
  try {
    const result = await checkEmailAvailability(formData.email);
    setEmailChecked(true);
    if (!result.available) {
      setErrors(prev => ({ ...prev, email: '이미 사용 중인 이메일입니다' }));
    }
  } catch (error) {
    // 에러 처리
  }
};
```

### Step 5: 회원가입 제출 로직 수정
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // 이메일 인증 확인
  if (!emailVerified) {
    setErrors(prev => ({ ...prev, email: '이메일 인증을 완료해주세요' }));
    return;
  }

  if (isSubmitting || !validateForm()) {
    return;
  }

  setIsSubmitting(true);

  try {
    const user = await signup(formData);
    
    // USER는 APPROVED, ACADEMY는 PENDING
    if (user.accountType === 'ACADEMY' && user.approvalStatus === 'PENDING') {
      navigate('/login', {
        state: { 
          message: '회원가입이 완료되었습니다. 관리자 승인 후 로그인 가능합니다.' 
        }
      });
    } else {
      navigate('/login', {
        state: { message: '회원가입이 완료되었습니다! 로그인해주세요.' }
      });
    }
  } catch (error) {
    // RFC 7807 에러 처리
  } finally {
    setIsSubmitting(false);
  }
};
```

### Step 6: 에러 처리 및 UX 개선
```typescript
// Axios 에러 인터셉터
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.data?.type) {
      // RFC 7807 Problem Details
      const problem = error.response.data;
      return Promise.reject({
        status: problem.status,
        message: problem.detail,
        errors: problem.errors,
      });
    }
    return Promise.reject(error);
  }
);
```

---

## UI 레이아웃 제안

### 이메일 인증 섹션
```
┌─────────────────────────────────────────────┐
│ 이메일 *                                     │
│ ┌────────────────────┬──────────────────┐   │
│ │ example@email.com  │ [인증 코드 발송]  │   │
│ └────────────────────┴──────────────────┘   │
│ ⚠️ 이메일 형식이 올바르지 않습니다            │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 인증 코드 (3분 내 입력)  ⏱️ 2:45             │
│ ┌────────────────────┬──────────────────┐   │
│ │ 123456             │ [인증 확인]       │   │
│ └────────────────────┴──────────────────┘   │
│ 재발송 (60초 후)                             │
│ ✅ 이메일 인증이 완료되었습니다               │
└─────────────────────────────────────────────┘
```

---

## 테스트 체크리스트

### 이메일 인증
- [ ] 유효한 이메일로 인증 코드 발송 성공
- [ ] 잘못된 이메일 형식 시 발송 버튼 비활성화
- [ ] 60초 쿨다운 동안 재발송 버튼 비활성화
- [ ] 3분 경과 시 인증 만료 메시지
- [ ] 올바른 인증 코드 입력 시 인증 성공
- [ ] 잘못된 인증 코드 입력 시 에러 메시지
- [ ] 인증 성공 시 체크 아이콘 표시

### 이메일 중복 확인
- [ ] 사용 가능한 이메일 확인
- [ ] 중복된 이메일 확인
- [ ] 중복 확인 완료 상태 표시

### 회원가입
- [ ] USER 계정 회원가입 성공 (APPROVED)
- [ ] ACADEMY 계정 회원가입 성공 (PENDING)
- [ ] 이메일 미인증 시 회원가입 차단
- [ ] 전화번호 중복 시 에러 표시
- [ ] Validation 실패 시 에러 표시

---

## 참고 문서
- 백엔드 API 명세: `Java/docs/api/01_signup.md`
- 타입 정의: `src/types/index.ts`
- Validation 유틸: `src/utils/validation.ts`
