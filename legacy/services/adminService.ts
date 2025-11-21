/**
 * 관리자 페이지 서비스
 * 관리자 전용 기능에 대한 API 통신 처리
 */

import {
  CourseApprovalRequest,
  ReviewApprovalRequest,
  AdminUser,
  AdminAcademy,
  AcademyQnA,
  BannerData,
  mockCourseApprovalRequests,
  mockReviewApprovalRequests,
  mockAdminUsers,
  mockAdminAcademies,
  mockAcademyQnA
} from '../data/mockAdminData';
import {
  getAllBanners,
  createBanner as createBannerService,
  updateBanner as updateBannerService,
  deleteBanner as deleteBannerService
} from './bannerService';

/**
 * 과정 승인 요청 목록 조회
 */
export const getCourseApprovalRequests = async (
  status?: '대기' | '승인' | '거부'
): Promise<CourseApprovalRequest[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (status) {
    return mockCourseApprovalRequests.filter(req => req.status === status);
  }
  return mockCourseApprovalRequests;
};

/**
 * 과정 승인 요청 처리
 */
export const processCourseApproval = async (
  requestId: number,
  action: '승인' | '거부'
): Promise<CourseApprovalRequest> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = mockCourseApprovalRequests.findIndex(req => req.id === requestId);
  if (index === -1) {
    throw new Error('요청을 찾을 수 없습니다.');
  }
  
  const updatedRequest = { ...mockCourseApprovalRequests[index], status: action };
  mockCourseApprovalRequests[index] = updatedRequest;
  
  return updatedRequest;
};

/**
 * 삭제된 과정 복구
 */
export const restoreCourse = async (
  requestId: number
): Promise<CourseApprovalRequest> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = mockCourseApprovalRequests.findIndex(req => req.id === requestId);
  if (index === -1) {
    throw new Error('요청을 찾을 수 없습니다.');
  }
  
  mockCourseApprovalRequests[index] = { 
    ...mockCourseApprovalRequests[index], 
    status: '대기' 
  };
  return mockCourseApprovalRequests[index];
};
/**
 * 리뷰 승인 요청 목록 조회
 */
export const getReviewApprovalRequests = async (
  status?: '대기' | '승인' | '거부'
): Promise<ReviewApprovalRequest[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (status) {
    return mockReviewApprovalRequests.filter(req => req.status === status);
  }
  return mockReviewApprovalRequests;
};

/**
 * 리뷰 승인 요청 처리
 */
export const processReviewApproval = async (
  requestId: number,
  action: '승인' | '거부'
): Promise<ReviewApprovalRequest> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = mockReviewApprovalRequests.findIndex(req => req.id === requestId);
  if (index === -1) {
    throw new Error('요청을 찾을 수 없습니다.');
  }
  
  const updatedRequest = { ...mockReviewApprovalRequests[index], status: action };
  mockReviewApprovalRequests[index] = updatedRequest;
  
  return updatedRequest;
};

/**
 * 회원 목록 조회
 */
export const getAdminUsers = async (
  filters?: {
    accountType?: 'ADMIN' | 'USER' | 'ACADEMY';
    status?: '활성' | '정지' | '탈퇴';
    searchTerm?: string;
  }
): Promise<AdminUser[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  let users = [...mockAdminUsers];
  
  if (filters?.accountType) {
    users = users.filter(user => user.accountType === filters.accountType);
  }
  
  if (filters?.status) {
    users = users.filter(user => user.status === filters.status);
  }
  
  if (filters?.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    users = users.filter(
      user =>
        user.username.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
    );
  }
  
  return users;
};

/**
 * 회원 상태 변경
 */
export const updateUserStatus = async (
  userId: number,
  status: '활성' | '정지' | '탈퇴'
): Promise<AdminUser> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = mockAdminUsers.findIndex(u => u.id === userId);
  if (index === -1) {
    throw new Error('회원을 찾을 수 없습니다.');
  }
  
  mockAdminUsers[index] = { ...mockAdminUsers[index], status };
  return mockAdminUsers[index];
};

/**
 * 회원 삭제
 */
export const deleteUser = async (userId: number): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = mockAdminUsers.findIndex(u => u.id === userId);
  if (index === -1) {
    throw new Error('회원을 찾을 수 없습니다.');
  }
  
  mockAdminUsers.splice(index, 1);
};
/**
 * 훈련기관 목록 조회
 */
export const getAdminAcademies = async (
  filters?: {
    status?: '활성' | '정지';
    searchTerm?: string;
  }
): Promise<AdminAcademy[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  let academies = [...mockAdminAcademies];
  
  if (filters?.status) {
    academies = academies.filter(academy => academy.status === filters.status);
  }
  
  if (filters?.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    academies = academies.filter(
      academy =>
        academy.name.toLowerCase().includes(term) ||
        academy.email.toLowerCase().includes(term)
    );
  }
  
  return academies;
};

/**
 * 훈련기관 등록
 */
export const createAcademy = async (
  data: Omit<AdminAcademy, 'id' | 'registeredDate' | 'courseCount'>
): Promise<AdminAcademy> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const nextId = mockAdminAcademies.length 
    ? Math.max(...mockAdminAcademies.map(a => a.id)) + 1 
    : 1;
  
  const newAcademy = {
    ...data,
    id: nextId,
    registeredDate: new Date().toISOString().split('T')[0],
    courseCount: 0
  };
  
  mockAdminAcademies.push(newAcademy);
  return newAcademy;
};

/**
 * 훈련기관 수정
 */
export const updateAcademy = async (
  academyId: number,
  data: Partial<AdminAcademy>
): Promise<AdminAcademy> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = mockAdminAcademies.findIndex(a => a.id === academyId);
  if (index === -1) {
    throw new Error('훈련기관을 찾을 수 없습니다.');
  }
  
  const updatedAcademy = { ...mockAdminAcademies[index], ...data };
  mockAdminAcademies[index] = updatedAcademy;
  
  return updatedAcademy;
};

/**
 * 훈련기관 삭제
 */
export const deleteAcademy = async (academyId: number): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = mockAdminAcademies.findIndex(a => a.id === academyId);
  if (index === -1) {
    throw new Error('훈련기관을 찾을 수 없습니다.');
  }

  mockAdminAcademies.splice(index, 1);
};
/**
 * 훈련기관 Q&A 목록 조회
 */
export const getAcademyQnA = async (
  filters?: {
    academyId?: number;
    status?: '대기' | '답변완료';
  }
): Promise<AcademyQnA[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  let qnaList = [...mockAcademyQnA];
  
  if (filters?.academyId) {
    qnaList = qnaList.filter(qna => qna.academyId === filters.academyId);
  }
  
  if (filters?.status) {
    qnaList = qnaList.filter(qna => qna.status === filters.status);
  }
  
  return qnaList;
};

/**
 * 훈련기관 Q&A 답변 등록/수정
 */
export const answerAcademyQnA = async (
  qnaId: number,
  answer: string
): Promise<AcademyQnA> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = mockAcademyQnA.findIndex(q => q.id === qnaId);
  if (index === -1) {
    throw new Error('Q&A를 찾을 수 없습니다.');
  }
  
  const updatedQnA = {
    ...mockAcademyQnA[index],
    answer,
    answerDate: new Date().toISOString().split('T')[0],
    status: '답변완료' as const
  };
  
  mockAcademyQnA[index] = updatedQnA;
  
  return updatedQnA;
};

/**
 * 훈련기관 Q&A 삭제
 */
export const deleteAcademyQnA = async (qnaId: number): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = mockAcademyQnA.findIndex(q => q.id === qnaId);
  if (index === -1) {
    throw new Error('Q&A를 찾을 수 없습니다.');
  }
  
  mockAcademyQnA.splice(index, 1);
};
/**
 * 배너 목록 조회
 */
export const getBanners = async (
  activeOnly?: boolean
): Promise<BannerData[]> => {
  return getAllBanners(activeOnly);
};

/**
 * 배너 등록
 */
export const createBanner = async (
  data: Omit<BannerData, 'id' | 'createdDate'>
): Promise<BannerData> => {
  return createBannerService(data);
};

/**
 * 배너 수정
 */
export const updateBanner = async (
  bannerId: number,
  data: Partial<BannerData>
): Promise<BannerData> => {
  return updateBannerService(bannerId, data);
};

/**
 * 배너 삭제
 */
export const deleteBanner = async (bannerId: number): Promise<void> => {
  return deleteBannerService(bannerId);
};
