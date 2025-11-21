import type {
  Account,
  MyPost,
  MyComment,
  CourseFavorite,
} from '../types';

import {
  mockUserProfile,
  mockAcademyUserProfile,
  mockMyPosts,
  mockMyComments,
  mockBookmarkedCourses,
} from '../data/mockMyPageData';

// 모듈 레벨에서 저장된 프로필을 관리 (실제 API 연동 시에는 제거)
let storedProfile: Account | null = null;

// ============================================================================
// API 엔드포인트 정의 (백엔드 연동 시 사용)
// ============================================================================
// GET    /api/accounts/me                     - 내 정보 조회
// PUT    /api/accounts/me                     - 내 정보 수정
// POST   /api/accounts/me/image               - 프로필 이미지 업로드
// GET    /api/accounts/me/posts               - 내가 작성한 게시글 목록
// GET    /api/accounts/me/comments            - 내가 작성한 댓글 목록
// GET    /api/accounts/me/favorites           - 내가 찜한 과정 목록
// POST   /api/courses/{courseId}/favorite     - 과정 찜하기
// DELETE /api/courses/{courseId}/favorite     - 과정 찜 취소
// ============================================================================

/**
 * 사용자 프로필 정보를 가져옵니다.
 * @param userId 사용자 ID
 * @returns 사용자 프로필 정보
 */
export const getUserProfile = async (userId?: number): Promise<Account> => {
  // 실제 API: const response = await axios.get('/api/accounts/me');
  // return response.data;
  
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  // 저장된 프로필이 있으면 반환
  if (storedProfile) {
    return storedProfile;
  }
  
  // 임시로 userId에 따라 다른 프로필 반환하고 저장
  const profile = userId === 2 ? mockAcademyUserProfile : mockUserProfile;
  storedProfile = { ...profile }; // 목업 데이터 복사하여 저장
  return storedProfile;
};

/**
 * 사용자가 작성한 게시글 목록을 가져옵니다.
 * @param page 페이지 번호
 * @param limit 페이지당 항목 수
 * @returns 작성한 게시글 목록
 */
export const getMyPosts = async (
  page: number = 1,
  limit: number = 10
): Promise<{ posts: MyPost[]; total: number }> => {
  // 실제 API: const response = await axios.get('/api/accounts/me/posts', { params: { page, limit } });
  // return response.data;
  
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  const start = (page - 1) * limit;
  const end = start + limit;
  const posts = mockMyPosts.slice(start, end);
  
  return {
    posts,
    total: mockMyPosts.length,
  };
};

/**
 * 사용자가 작성한 댓글 목록을 가져옵니다.
 * @param page 페이지 번호
 * @param limit 페이지당 항목 수
 * @returns 작성한 댓글 목록
 */
export const getMyComments = async (
  page: number = 1,
  limit: number = 10
): Promise<{ comments: MyComment[]; total: number }> => {
  // 실제 API: const response = await axios.get('/api/accounts/me/comments', { params: { page, limit } });
  // return response.data;
  
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  const start = (page - 1) * limit;
  const end = start + limit;
  const comments = mockMyComments.slice(start, end);
  
  return {
    comments,
    total: mockMyComments.length,
  };
};

/**
 * 사용자가 찜한 과정 목록을 가져옵니다.
 * @returns 찜한 과정 목록
 */
export const getBookmarkedCourses = async (): Promise<CourseFavorite[]> => {
  // 실제 API: const response = await axios.get('/api/accounts/me/favorites');
  // return response.data;
  
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  return mockBookmarkedCourses;
};

/**
 * 프로필 정보를 업데이트합니다.
 * 인증된 사용자의 프로필을 업데이트하므로 userId는 불필요합니다.
 * @param profileData 업데이트할 프로필 정보
 * @returns 업데이트된 프로필 정보
 */
export const updateUserProfile = async (
  profileData: Partial<Account>
): Promise<Account> => {
  // 실제 API: const response = await axios.put('/api/accounts/me', profileData);
  // return response.data;
  
  // 목업: 인위적인 딜레이 후 업데이트된 데이터 반환
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // 현재 저장된 프로필을 기반으로 업데이트 (없으면 mockUserProfile 사용)
  const baseProfile = storedProfile || { ...mockUserProfile };
  
  // 업데이트된 프로필 생성 (목업 데이터 변경 방지)
  const updatedProfile = {
    ...baseProfile,
    ...profileData,
  };
  
  // 업데이트된 프로필을 저장
  storedProfile = updatedProfile;
  
  return updatedProfile;
};

/**
 * 과정 찜하기/취소를 처리합니다.
 * @param courseId 과정 ID
 * @param isBookmarked 찜 상태
 * @returns 성공 여부
 */
export const toggleCourseBookmark = async (
  courseId: number,
  isBookmarked: boolean
): Promise<boolean> => {
  // TODO: 실제 API 호출로 대체 예정
  // if (isBookmarked) {
  //   const response = await fetch(`/api/courses/${courseId}/bookmark`, {
  //     method: 'POST',
  //   });
  //   if (!response.ok) throw new Error('Failed to bookmark course');
  // } else {
  //   const response = await fetch(`/api/courses/${courseId}/bookmark`, {
  //     method: 'DELETE',
  //   });
  //   if (!response.ok) throw new Error('Failed to unbookmark course');
  // }
  
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  return true;
};

/**
 * 프로필 이미지를 업로드합니다.
 * @param userId 사용자 ID
 * @param formData 이미지 파일이 포함된 FormData
 * @returns 업로드된 이미지 URL
 */
export const uploadProfileImage = async (
  userId: number,
  formData: FormData
): Promise<string> => {
  // TODO: 실제 API 호출로 대체 예정
  // const response = await fetch(`/api/users/${userId}/profile/image`, {
  //   method: 'POST',
  //   body: formData,
  // });
  // if (!response.ok) throw new Error('Failed to upload profile image');
  // const data = await response.json();
  // return data.imageUrl;
  
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // 목업: 임시 URL 반환
  return 'https://via.placeholder.com/150';
};
