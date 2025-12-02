# 마이페이지 백엔드 API 요구사항 명세서

## 1. 개요
마이페이지(MyPage)의 **비밀번호 변경** 기능과 **활동 내역(대시보드)** 기능을 완성하기 위해 필요한 백엔드 API 목록입니다. 현재 프론트엔드는 Mock 데이터를 사용하고 있으며, 실제 데이터 연동을 위해 아래 API 구현이 필요합니다.

## 2. 필수 구현 API (Priority: High)

### 2.1. 비밀번호 변경
*   **Endpoint**: `PUT /api/mypage/password`
*   **Description**: 로그인한 사용자의 비밀번호를 변경합니다.
*   **Request Header**: `Authorization: Bearer {token}`
*   **Request Body**:
    ```json
    {
      "password": "new_password_123!"
    }
    ```
*   **Response**: `200 OK`
*   **Note**: 프론트엔드에서 이메일 인증을 선행하지만, 백엔드에서도 보안을 위해 현재 비밀번호를 한 번 더 확인하거나, 이메일 인증 토큰을 함께 요구하는 방식을 고려할 수 있습니다. (현재 프론트엔드 구현은 인증 후 바로 변경 요청을 보냄)

## 3. 활동 내역 조회 API (Priority: Medium)
*현재 프론트엔드 `src/pages/MyPage/data.ts`의 Mock 데이터를 대체해야 합니다.*

### 3.1. 내가 쓴 글 목록
*   **Endpoint**: `GET /api/mypage/posts`
*   **Description**: 사용자가 작성한 게시글 목록을 조회합니다.
*   **Response**:
    ```json
    [
      {
        "id": 1,
        "title": "React 19 새로운 기능",
        "category": "CODING_STORY",
        "createdAt": "2024-01-15",
        "views": 245,
        "comments": 12
      },
      ...
    ]
    ```

### 3.2. 내가 쓴 댓글 목록
*   **Endpoint**: `GET /api/mypage/comments`
*   **Description**: 사용자가 작성한 댓글 목록을 조회합니다.
*   **Response**:
    ```json
    [
      {
        "id": 1,
        "postTitle": "원본 게시글 제목",
        "content": "댓글 내용입니다.",
        "createdAt": "2024-01-14"
      },
      ...
    ]
    ```

### 3.3. 찜한 강좌 목록
*   **Endpoint**: `GET /api/mypage/bookmarks`
*   **Description**: 사용자가 찜(Bookmark)한 강좌 목록을 조회합니다.
*   **Response**:
    ```json
    [
      {
        "id": 1,
        "title": "React 완벽 마스터",
        "academy": "코딩마스터",
        "category": "프론트엔드",
        "rating": 4.8
      },
      ...
    ]
    ```

### 3.4. 활동 통계 (Optional)
*   **Endpoint**: `GET /api/mypage/stats`
*   **Description**: 대시보드 상단 KPI 카드에 들어갈 통계 데이터를 조회합니다. (API를 별도로 만들지 않고 위 목록 API들의 `length`로 계산할 수도 있음)
*   **Response**:
    ```json
    {
      "totalPosts": 15,
      "totalComments": 42,
      "totalBookmarks": 5,
      "totalViews": 1250
    }
    ```

## 4. 참고 사항
*   **페이지네이션**: 글이나 댓글이 많을 경우를 대비해 `page`, `size` 파라미터를 지원하면 좋습니다.
*   **정렬**: 최신순 정렬이 기본이어야 합니다.
