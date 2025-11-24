/**
 * 관리자 페이지 목업 데이터
 */

import type { AccountType } from '../types';

export interface CourseApprovalRequest {
  id: number;
  courseTitle: string;
  academyName: string;
  category: string;
  target: '취업예정자' | '재직자';
  format: '온라인' | '오프라인';
  requestType: '등록' | '삭제';
  requestDate: string;
  status: '대기' | '승인' | '거부';
  requesterId: number;
  requesterName: string;
}

export interface ReviewApprovalRequest {
  id: number;
  reviewId: number;
  courseTitle: string;
  authorName: string;
  rating: number;
  content: string;
  requestType: '등록' | '삭제';
  requestDate: string;
  status: '대기' | '승인' | '거부';
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  accountType: AccountType;
  registeredDate: string;
  lastLogin: string;
  status: '활성' | '정지' | '탈퇴';
  postCount: number;
  commentCount: number;
}

export interface AdminAcademy {
  id: number;
  name: string;
  businessNumber: string;
  address: string;
  phone: string;
  email: string;
  registeredDate: string;
  courseCount: number;
  status: '활성' | '정지';
}

export interface AcademyQnA {
  id: number;
  academyId: number;
  academyName: string;
  question: string;
  answer: string | null;
  questionAuthor: string;
  questionDate: string;
  answerDate: string | null;
  status: '대기' | '답변완료';
}

export interface BannerData {
  id: number;
  title: string;
  description?: string; // 배너에 표시될 설명 텍스트 (선택사항)
  imageFile?: File; // 업로드된 이미지 파일
  imageUrl?: string; // 이미지 URL (파일 업로드 후 생성되거나 기존 데이터)
  linkUrl: string;
  displayOrder: number;
  isActive: boolean;
  startDate?: string; // 노출 시작일 (없으면 무기한)
  endDate?: string; // 노출 종료일 (없으면 무기한)
  createdDate: string;
}

// 과정 승인 요청 목업 데이터
export const mockCourseApprovalRequests: CourseApprovalRequest[] = [
  {
    id: 1,
    courseTitle: 'React 실전 프로젝트 마스터',
    academyName: '코드잇',
    category: '프론트엔드',
    target: '재직자',
    format: '온라인',
    requestType: '등록',
    requestDate: '2025-10-28',
    status: '대기',
    requesterId: 5,
    requesterName: '김교육'
  },
  {
    id: 2,
    courseTitle: 'Spring Boot 실무 완성',
    academyName: '패스트캠퍼스',
    category: '백엔드',
    target: '취업예정자',
    format: '오프라인',
    requestType: '등록',
    requestDate: '2025-10-27',
    status: '대기',
    requesterId: 8,
    requesterName: '이강사'
  },
  {
    id: 3,
    courseTitle: 'DevOps 입문 과정',
    academyName: '인프런',
    category: '데브옵스/인프라/툴',
    target: '재직자',
    format: '온라인',
    requestType: '삭제',
    requestDate: '2025-10-26',
    status: '승인',
    requesterId: 12,
    requesterName: '박운영'
  },
  {
    id: 4,
    courseTitle: 'Vue.js 기초부터 실전까지',
    academyName: '코드잇',
    category: '프론트엔드',
    target: '취업예정자',
    format: '온라인',
    requestType: '삭제',
    requestDate: '2025-10-25',
    status: '승인',
    requesterId: 5,
    requesterName: '김교육'
  }
];

// 리뷰 승인 요청 목업 데이터
export const mockReviewApprovalRequests: ReviewApprovalRequest[] = [
  {
    id: 1,
    reviewId: 101,
    courseTitle: 'Next.js 완벽 가이드',
    authorName: '최개발',
    rating: 5,
    content: '정말 유익한 강의였습니다. 실무에 바로 적용할 수 있는 내용들로 가득했어요.',
    requestType: '등록',
    requestDate: '2025-10-28',
    status: '대기'
  },
  {
    id: 2,
    reviewId: 102,
    courseTitle: 'AWS 클라우드 실습',
    authorName: '정수강',
    rating: 4,
    content: '클라우드 기초부터 심화까지 체계적으로 배울 수 있었습니다.',
    requestType: '등록',
    requestDate: '2025-10-27',
    status: '대기'
  }
];

// 회원 관리 목업 데이터
export const mockAdminUsers: AdminUser[] = [
  {
    id: 1,
    username: '김철수',
    email: 'kim@example.com',
    accountType: 'USER',
    registeredDate: '2024-03-15',
    lastLogin: '2025-10-28',
    status: '활성',
    postCount: 12,
    commentCount: 34
  },
  {
    id: 2,
    username: '이영희',
    email: 'lee@example.com',
    accountType: 'USER',
    registeredDate: '2024-05-20',
    lastLogin: '2025-10-27',
    status: '활성',
    postCount: 8,
    commentCount: 21
  },
  {
    id: 3,
    username: '박지성',
    email: 'park@example.com',
    accountType: 'ACADEMY',
    registeredDate: '2024-01-10',
    lastLogin: '2025-10-28',
    status: '활성',
    postCount: 45,
    commentCount: 67
  },
  {
    id: 4,
    username: '정관리',
    email: 'admin@example.com',
    accountType: 'ADMIN',
    registeredDate: '2023-12-01',
    lastLogin: '2025-10-29',
    status: '활성',
    postCount: 3,
    commentCount: 89
  },
  {
    id: 5,
    username: '최정지',
    email: 'choi@example.com',
    accountType: 'USER',
    registeredDate: '2024-07-08',
    lastLogin: '2025-09-15',
    status: '정지',
    postCount: 2,
    commentCount: 1
  }
];

// 훈련기관 관리 목업 데이터
export const mockAdminAcademies: AdminAcademy[] = [
  {
    id: 1,
    name: '코드잇',
    businessNumber: '123-45-67890',
    address: '서울시 강남구 테헤란로 123',
    phone: '02-1234-5678',
    email: 'contact@codeit.kr',
    registeredDate: '2024-01-15',
    courseCount: 24,
    status: '활성'
  },
  {
    id: 2,
    name: '패스트캠퍼스',
    businessNumber: '234-56-78901',
    address: '서울시 강남구 역삼동 456',
    phone: '02-2345-6789',
    email: 'info@fastcampus.co.kr',
    registeredDate: '2023-11-20',
    courseCount: 38,
    status: '활성'
  },
  {
    id: 3,
    name: '인프런',
    businessNumber: '345-67-89012',
    address: '서울시 서초구 서초대로 789',
    phone: '02-3456-7890',
    email: 'support@inflearn.com',
    registeredDate: '2024-03-10',
    courseCount: 52,
    status: '활성'
  }
];

// 훈련기관 Q&A 목업 데이터
export const mockAcademyQnA: AcademyQnA[] = [
  {
    id: 1,
    academyId: 1,
    academyName: '코드잇',
    question: '환불 정책이 어떻게 되나요?',
    answer: '수강 시작 후 7일 이내, 진도율 10% 미만인 경우 전액 환불 가능합니다.',
    questionAuthor: '김문의',
    questionDate: '2025-10-25',
    answerDate: '2025-10-26',
    status: '답변완료'
  },
  {
    id: 2,
    academyId: 1,
    academyName: '코드잇',
    question: '수강 기간은 얼마나 되나요?',
    answer: null,
    questionAuthor: '이질문',
    questionDate: '2025-10-28',
    answerDate: null,
    status: '대기'
  },
  {
    id: 3,
    academyId: 2,
    academyName: '패스트캠퍼스',
    question: '오프라인 강의는 어디서 진행되나요?',
    answer: '강남역 인근 강의장에서 진행되며, 등록 시 상세 주소를 안내드립니다.',
    questionAuthor: '박궁금',
    questionDate: '2025-10-24',
    answerDate: '2025-10-25',
    status: '답변완료'
  }
];

