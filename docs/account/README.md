# Account 기능 프론트엔드 개발 가이드

## 개요
Account 관련 기능(회원가입, 로그인, 마이페이지)의 프론트엔드 구현 현황 및 백엔드 API 연동 가이드입니다.

## 백엔드 API ↔ 프론트엔드 매핑

### 회원가입 (Signup)
| 백엔드 API | Method | 프론트엔드 | 상태 |
|-----------|--------|-----------|------|
| `/api/auth/email/send-verification` | POST | SignupPage.tsx | ❌ 미구현 |
| `/api/auth/email/verify` | POST | SignupPage.tsx | ❌ 미구현 |
| `/api/auth/check-email` | GET | SignupPage.tsx | ❌ 미구현 |
| `/api/auth/signup` | POST | SignupPage.tsx | ⚠️ Mock만 존재 |

### 로그인 (Login)
| 백엔드 API | Method | 프론트엔드 | 상태 |
|-----------|--------|-----------|------|
| `/api/auth/login` | POST | LoginPage.tsx | ⚠️ 확인 필요 |
| `/api/auth/refresh` | POST | - | ❌ 미구현 |
| `/api/auth/logout` | POST | - | ❌ 미구현 |

### 마이페이지 (MyPage)
| 백엔드 API | Method | 프론트엔드 | 상태 |
|-----------|--------|-----------|------|
| `/api/mypage/profile` | GET | MyPage.tsx | ⚠️ 확인 필요 |
| `/api/mypage/profile` | PATCH | MyPage.tsx | ⚠️ 확인 필요 |
| `/api/mypage/account` | DELETE | MyPage.tsx | ⚠️ 확인 필요 |

## 컴포넌트 구조

### 회원가입 관련
```
src/pages/SignupPage.tsx              # 메인 회원가입 페이지
src/components/auth/
  └── AcademySelectModal.tsx          # 기관 선택 모달
src/types/index.ts                     # SignupFormData 타입 정의
src/utils/validation.ts                # 폼 Validation 유틸
```

### 로그인 관련
```
src/pages/LoginPage.tsx               # 메인 로그인 페이지
src/store/                             # 인증 상태 관리 (확인 필요)
```

### 마이페이지 관련
```
src/pages/MyPage.tsx                  # 마이페이지 (확인 필요)
```

## API Service 계층 구축 필요

### 현재 상태
- ❌ API Service 계층 없음
- ❌ Axios/Fetch 래퍼 없음
- ❌ 에러 처리 공통 로직 없음
- ❌ JWT 토큰 Interceptor 없음

### 구축 필요 항목
```
src/services/
  ├── api.ts                          # Axios 인스턴스 설정
  ├── authService.ts                  # 회원가입/로그인 API
  ├── mypageService.ts                # 마이페이지 API
  └── types.ts                        # API Request/Response 타입
```

## 작업 우선순위

### 1단계: 회원가입 이메일 인증 (최우선) 🔥
- [ ] 이메일 인증 코드 발송 UI 추가
- [ ] 인증 코드 입력 필드 추가
- [ ] 인증 완료 상태 관리
- [ ] API Service 함수 작성
- [ ] 에러 처리 및 사용자 피드백

### 2단계: API Service 계층 구축
- [ ] Axios 인스턴스 설정
- [ ] JWT 토큰 Interceptor
- [ ] 에러 처리 공통 로직
- [ ] API 함수 타입 정의

### 3단계: 로그인 JWT 토큰 관리
- [ ] 토큰 저장 (localStorage vs sessionStorage)
- [ ] 토큰 자동 갱신 로직
- [ ] Protected Route 설정
- [ ] 로그아웃 처리

### 4단계: 마이페이지 API 연동
- [ ] 프로필 조회 API 연동
- [ ] 프로필 수정 (Partial Update)
- [ ] 계정 삭제 확인 다이얼로그

## 공통 고려사항

### 1. 에러 처리 (RFC 7807 Problem Details)
백엔드는 RFC 7807 형식으로 에러 반환:
```typescript
interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  errors?: Record<string, string>;
}
```

### 2. Form Validation
- 클라이언트 Validation (즉시 피드백)
- 서버 Validation 에러 표시
- 에러 메시지 한글화

### 3. Loading 상태 관리
- 버튼 비활성화
- 로딩 인디케이터
- 중복 제출 방지

### 4. JWT 토큰 관리
- Access Token: 1시간 (개발 환경)
- Refresh Token: 7일
- 토큰 만료 시 자동 갱신

### 5. 보안
- HTTPS 사용 (프로덕션)
- XSS 방지
- CSRF 토큰 (필요시)

## 백엔드 API 상세 문서 참조
- 회원가입: `Java/docs/api/01_signup.md`
- 로그인: `Java/docs/api/02_login.md`
- 마이페이지: `Java/docs/api/03_mypage.md`

## 다음 단계
1. `01_signup_frontend.md` - 회원가입 상세 분석 및 개조 계획
2. `02_login_frontend.md` - 로그인 상세 분석 및 개조 계획
3. `03_mypage_frontend.md` - 마이페이지 상세 분석 및 개조 계획
