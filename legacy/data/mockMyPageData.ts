import type {
  Account,
  MyPost,
  MyComment,
  CourseFavorite,
  ApprovalStatus,
} from '../types';

/**
 * 사용자 프로필 목업 데이터
 */
export const mockUserProfile: Account = {
  id: 1,
  userName: '김소프트',
  email: 'kim.soft@example.com',
  phoneNumber: '010-1234-5678',
  accountType: 'USER',
  affiliation: '(주)테크컴퍼니',
  position: '개발팀',
  profileImage: 'https://via.placeholder.com/150',
  createdAt: '2024-01-15T09:00:00Z',
};

/**
 * 기관 회원 프로필 목업 데이터
 */
export const mockAcademyUserProfile: Account = {
  id: 2,
  userName: '코스타관리자',
  email: 'admin@kosta.com',
  phoneNumber: '02-1234-5678',
  accountType: 'ACADEMY',
  profileImage: 'https://via.placeholder.com/150',
  createdAt: '2023-06-01T09:00:00Z',
  academyInfo: {
    id: 1,
    name: 'KOSTA',
    isApproved: 'APPROVED' as ApprovalStatus,
  },
};

/**
 * 작성한 게시글 목업 데이터
 */
export const mockMyPosts: MyPost[] = [
  {
    id: 1,
    title: 'React Hooks 사용 팁 공유합니다',
    category: 'CODING',
    hits: 245,
    recommendCount: 18,
    commentCount: 12,
    createdAt: '2025-10-25T14:30:00Z',
  },
  {
    id: 2,
    title: '백엔드 개발자 로드맵 질문드려요',
    category: 'CAREER',
    hits: 189,
    recommendCount: 9,
    commentCount: 24,
    createdAt: '2025-10-20T09:15:00Z',
  },
  {
    id: 3,
    title: 'KOSTA 과정 후기 - 솔직하게 작성합니다',
    category: 'CODING',
    hits: 512,
    recommendCount: 45,
    commentCount: 38,
    createdAt: '2025-10-15T16:45:00Z',
  },
  {
    id: 4,
    title: '신입 개발자 취업 준비 방법',
    category: 'CAREER',
    hits: 324,
    recommendCount: 28,
    commentCount: 15,
    createdAt: '2025-10-10T11:20:00Z',
  },
  {
    id: 5,
    title: 'TypeScript 마이그레이션 경험담',
    category: 'CODING',
    hits: 156,
    recommendCount: 12,
    commentCount: 8,
    createdAt: '2025-10-05T13:50:00Z',
  },
];

/**
 * 작성한 댓글 목업 데이터
 */
export const mockMyComments: MyComment[] = [
  {
    id: 1,
    boardId: 201,
    postTitle: 'Spring Security 설정 질문',
    text: 'JWT 토큰 방식으로 구현하시는 걸 추천드립니다. 제가 사용했던 코드 공유할게요...',
    category: 'CODING',
    createdAt: '2025-10-28T10:30:00Z',
  },
  {
    id: 2,
    boardId: 202,
    postTitle: '비전공자 개발자 전향 고민',
    text: '저도 비전공 출신입니다. 부트캠프 6개월 수료 후 취업했어요. 포기하지 마세요!',
    category: 'CAREER',
    createdAt: '2025-10-27T15:45:00Z',
  },
  {
    id: 3,
    boardId: 203,
    postTitle: 'React vs Vue 무엇을 배워야 할까요?',
    text: '현재 취업 시장에서는 React 수요가 더 많은 것 같습니다. 다만 Vue도 충분히 좋은 프레임워크입니다.',
    category: 'CAREER',
    createdAt: '2025-10-26T09:20:00Z',
  },
  {
    id: 4,
    boardId: 204,
    postTitle: 'Git 협업 플로우 질문',
    text: 'GitHub Flow가 입문자에게는 가장 이해하기 쉽습니다. feature 브랜치에서 작업 후 PR 올리는 방식이에요.',
    category: 'CODING',
    createdAt: '2025-10-24T14:10:00Z',
  },
  {
    id: 5,
    boardId: 205,
    postTitle: '코딩 테스트 준비 어떻게 하셨나요?',
    text: '백준과 프로그래머스를 병행했습니다. 하루 2문제씩 꾸준히 푸는 게 중요해요.',
    category: 'CAREER',
    createdAt: '2025-10-22T11:35:00Z',
  },
];

/**
 * 찜한 과정 목업 데이터
 */
export const mockBookmarkedCourses: CourseFavorite[] = [
  {
    id: 1,
    courseId: 301,
    courseName: 'Next.js 14 실전 프로젝트',
    academy: '인프런',
    rating: 4.8,
    reviewCount: 342,
    imageUrl: 'https://via.placeholder.com/300x200?text=Next.js+14',
    createdAt: '2025-10-26T10:00:00Z',
  },
  {
    id: 2,
    courseId: 302,
    courseName: 'Docker & Kubernetes 완벽 가이드',
    academy: 'Udemy',
    rating: 4.9,
    reviewCount: 521,
    imageUrl: 'https://via.placeholder.com/300x200?text=Docker+K8s',
    createdAt: '2025-10-24T15:30:00Z',
  },
  {
    id: 3,
    courseId: 303,
    courseName: 'Python 데이터 분석 마스터',
    academy: '패스트캠퍼스',
    rating: 4.7,
    reviewCount: 289,
    imageUrl: 'https://via.placeholder.com/300x200?text=Python+Data',
    createdAt: '2025-10-20T09:45:00Z',
  },
  {
    id: 4,
    courseId: 304,
    courseName: 'AI 챗봇 개발 실습',
    academy: 'KOSTA',
    rating: 4.6,
    reviewCount: 156,
    imageUrl: 'https://via.placeholder.com/300x200?text=AI+Chatbot',
    createdAt: '2025-10-18T14:20:00Z',
  },
];
