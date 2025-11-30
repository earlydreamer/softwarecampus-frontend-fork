# Phase 2: 마이페이지 기능 고도화 및 백엔드 연동 완료 보고서

**작성일**: 2025년 11월 29일
**작성자**: GitHub Copilot
**상태**: 완료 (Review Ready)

## 1. 개요
본 문서는 마이페이지(MyPage)의 핵심 기능인 **프로필 수정(이미지 포함)**, **비밀번호 변경**, **회원 탈퇴** 기능을 백엔드 API와 완전히 연동하고, 사용자 경험(UX)을 개선하기 위해 수행된 작업 내역을 정리합니다.

## 2. 주요 변경 사항 요약

| 구분 | 기능 | 상세 내용 | 상태 |
| :--- | :--- | :--- | :--- |
| **Backend** | **프로필 이미지** | `Account` 엔티티 필드 추가 및 업로드/수정 로직 구현 | ✅ 완료 |
| | **비밀번호 변경** | 로그인 상태에서 새 비밀번호로 즉시 변경하는 `changePassword` API 구현 | ✅ 완료 |
| | **API 엔드포인트** | `PATCH /api/mypage/password`, `PATCH /api/mypage/profile` 업데이트 | ✅ 완료 |
| **Frontend** | **Proxy 설정** | Vite 개발 서버와 백엔드(8080) 간 CORS 문제 해결을 위한 Proxy 설정 | ✅ 완료 |
| | **이미지 업로드 UI** | `EditProfileModal` 내 이미지 미리보기 및 즉시 업로드 기능 구현 | ✅ 완료 |
| | **비밀번호 변경 UI** | `ChangePasswordModal` 백엔드 연동 (새 비밀번호 입력만 필요) | ✅ 완료 |
| | **사이드바** | 프로필 이미지가 있을 경우 아바타에 표시되도록 개선 | ✅ 완료 |

---

## 3. 상세 구현 내역

### 3.1 Backend (Java/Spring Boot)

#### 3.1.1 도메인 및 DTO 수정
- **`Account` Entity**: `profileImage` (String) 필드 추가.
- **`AccountResponse` Record**: 클라이언트로 프로필 이미지 URL을 전달하기 위해 필드 추가.
- **`UpdateProfileRequest` DTO**: 프로필 수정 시 이미지 URL을 받을 수 있도록 필드 추가.
- **`ChangePasswordRequest` DTO (신규)**: `newPassword`(새 비번) 필드를 포함하는 DTO 생성.

#### 3.1.2 비즈니스 로직 (`ProfileServiceImpl`)
- **프로필 수정 (`updateProfile`)**: 요청에 `profileImage`가 포함된 경우 DB 업데이트 처리.
- **비밀번호 변경 (`changePassword`)**:
    1.  DB에서 사용자 조회.
    2.  **현재 비밀번호 확인 없이** 새 비밀번호를 암호화하여 저장 (로그인 상태 신뢰).

#### 3.1.3 컨트롤러 (`MyPageController`)
- **`PATCH /api/mypage/password`**: 로그인 상태에서 비밀번호 변경 요청을 처리하는 엔드포인트 추가.

---

### 3.2 Frontend (React/TypeScript)

#### 3.2.1 개발 환경 설정 (`vite.config.ts`)
- **Proxy 설정 추가**:
    ```typescript
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        }
      }
    }
    ```
    - 개발 서버(3000)에서 `/api`로 시작하는 요청을 백엔드(8080)로 자동 포워딩하여 CORS 오류 방지.

#### 3.2.2 서비스 레이어 (`mypageService.ts`)
- **`updatePassword` 수정**: 인자를 `(newPassword)`로 변경하고 `PATCH` 메서드 사용.
- **`uploadFile` 추가**: `FormData`를 사용하여 이미지를 `POST /api/files/upload`로 전송하는 함수 구현.

#### 3.2.3 UI 컴포넌트
- **`EditProfileModal.tsx`**:
    - 프로필 이미지 클릭 시 파일 선택 창(`input type="file"`) 호출.
    - 이미지 선택 시 즉시 서버로 업로드하고, 반환된 URL을 미리보기로 표시.
    - '저장' 버튼 클릭 시 변경된 이미지 URL을 프로필 정보와 함께 전송.
- **`ChangePasswordModal.tsx`**:
    - 백엔드 API 변경에 맞춰 데이터 전송 구조 수정 (새 비밀번호만 전송).
- **`Sidebar.tsx`**:
    - `user.profileImage`가 존재하면 해당 이미지를 렌더링하고, 없으면 기존 이니셜 아바타 표시.

---

## 4. API 명세 (업데이트)

### 4.1 프로필 수정
- **URL**: `PATCH /api/mypage/profile`
- **Request Body**:
    ```json
    {
      "userName": "홍길동",
      "phoneNumber": "010-1234-5678",
      "profileImage": "https://s3.ap-northeast-2.amazonaws.com/.../image.jpg",
      ...
    }
    ```

### 4.2 비밀번호 변경 (로그인 상태)
- **URL**: `PATCH /api/mypage/password`
- **Request Body**:
    ```json
    {
      "newPassword": "newPassword123!"
    }
    ```

### 4.3 파일 업로드
- **URL**: `POST /api/files/upload`
- **Content-Type**: `multipart/form-data`
- **Parameters**: `file` (Binary), `folder` ("profile"), `fileType` ("PROFILE")

---

## 5. 향후 계획 (Next Steps)
1.  **통합 테스트**: 프론트엔드에서 실제 시나리오대로 전체 흐름(로그인 -> 프로필 수정 -> 비번 변경 -> 탈퇴) 테스트.
2.  **예외 처리 강화**: 이미지 업로드 실패, 용량 초과, 파일 형식 오류 등에 대한 프론트엔드 알림 처리 고도화.
3.  **보안 점검**: 파일 업로드 시 악성 파일 필터링(백엔드 이미 적용됨) 및 프론트엔드 유효성 검사 추가.
