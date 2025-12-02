/**
 * 관리자 페이지 목업 데이터
 */

import type {
    CourseApprovalRequest,
    ReviewApprovalRequest,
    AdminUser,
    AdminAcademy,
    BannerData
} from '../types';

// 과정 대상 타입 (types/index.ts에서 가져옴)
// export type CourseTarget = '취업예정자' | '재직자';

// 과정 형식 타입 (types/index.ts에서 가져옴)
// export type CourseFormat = '온라인' | '오프라인';

// 과정 승인 요청 목업 데이터
export const mockCourseApprovalRequests: CourseApprovalRequest[] = [
    {
        id: 1,
        courseName: 'React 실전 프로젝트 마스터',
        academyId: 1,
        academyName: '소프트웨어캠퍼스',
        requesterId: 3,
        requesterName: '김담당',
        category: '프론트엔드',
        target: '재직자',
        format: '온라인',
        requestType: '등록',
        requestDate: '2025-01-15',
        status: '대기',
        recruitStart: '2025-02-01',
        recruitEnd: '2025-02-28',
        courseStart: '2025-03-01',
        courseEnd: '2025-04-30',
        cost: 500000,
        isKdt: true,
        isNailbaeum: true,
        isOffline: false,
        description: 'React의 기초부터 심화까지 배우는 과정입니다.'
    },
    {
        id: 2,
        courseName: 'Spring Boot 실무 완성',
        academyId: 2,
        academyName: '패스트캠퍼스',
        requesterId: 8,
        requesterName: '이강사',
        category: '백엔드',
        target: '취업예정자',
        format: '오프라인',
        requestType: '등록',
        requestDate: '2025-01-14',
        status: '대기',
    },
    {
        id: 3,
        courseName: 'DevOps 입문 과정',
        academyId: 3,
        academyName: '인프런',
        requesterId: 12,
        requesterName: '박운영',
        category: '데브옵스/인프라',
        target: '재직자',
        format: '온라인',
        requestType: '삭제',
        requestDate: '2025-01-13',
        status: '승인',
    },
    {
        id: 4,
        courseName: 'Java 풀스택 개발자 양성 과정',
        academyId: 1,
        academyName: '소프트웨어캠퍼스',
        requesterId: 3,
        requesterName: '김담당',
        category: '풀스택',
        target: '취업예정자',
        format: '오프라인',
        requestType: '등록',
        requestDate: '2024-12-20',
        status: '승인',
        recruitStart: '2025-01-01',
        recruitEnd: '2025-01-31',
        courseStart: '2025-02-01',
        courseEnd: '2025-07-31',
        cost: 0,
        isKdt: true,
        isNailbaeum: true,
        isOffline: true,
        location: '서울시 강남구 테헤란로 123',
        description: '국비지원으로 진행되는 Java 풀스택 과정입니다.'
    }
];

// 리뷰 승인 요청 목업 데이터
export const mockReviewApprovalRequests: ReviewApprovalRequest[] = [
    {
        id: 1,
        reviewId: 101,
        courseName: 'Next.js 완벽 가이드',
        academyId: 1,
        writerName: '최개발',
        rating: 5,
        comment: '정말 유익한 강의였습니다. 실무에 바로 적용할 수 있는 내용들로 가득했어요.',
        requestType: '등록',
        requestDate: '2025-01-15',
        status: '대기'
    },
    {
        id: 2,
        reviewId: 102,
        courseName: 'AWS 클라우드 실습',
        academyId: 2,
        writerName: '정수강',
        rating: 4,
        comment: '클라우드 기초부터 심화까지 체계적으로 배울 수 있었습니다.',
        requestType: '등록',
        requestDate: '2025-01-14',
        status: '대기'
    }
];

// 회원 관리 목업 데이터
export const mockAdminUsers: AdminUser[] = [
    {
        id: 1,
        userName: '김철수',
        email: 'kim@example.com',
        accountType: 'USER',
        registeredDate: '2024-03-15',
        lastLogin: '2025-01-15',
        status: '활성',
        postCount: 12,
        commentCount: 34
    },
    {
        id: 2,
        userName: '이영희',
        email: 'lee@example.com',
        accountType: 'USER',
        registeredDate: '2024-05-20',
        lastLogin: '2025-01-14',
        status: '활성',
        postCount: 8,
        commentCount: 21
    },
    {
        id: 3,
        userName: '박지성',
        email: 'park@example.com',
        accountType: 'ACADEMY',
        registeredDate: '2024-01-10',
        lastLogin: '2025-01-15',
        status: '활성',
        postCount: 45,
        commentCount: 67
    },
    {
        id: 4,
        userName: '정관리',
        email: 'admin@example.com',
        accountType: 'ADMIN',
        registeredDate: '2023-12-01',
        lastLogin: '2025-01-16',
        status: '활성',
        postCount: 3,
        commentCount: 89
    },
    {
        id: 5,
        userName: '최정지',
        email: 'choi@example.com',
        accountType: 'USER',
        registeredDate: '2024-07-08',
        lastLogin: '2024-09-15',
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

// 배너 관리 목업 데이터
export const mockBanners: BannerData[] = [
    {
        id: 1,
        title: '2025년 국비지원 과정 모집',
        description: '취업률 1위! 소프트웨어캠퍼스 국비지원 과정 수강생 모집',
        imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
        linkUrl: '/lectures',
        displayOrder: 1,
        isActive: true,
        createdDate: '2024-12-01'
    },
    {
        id: 2,
        title: '신규 회원 가입 이벤트',
        description: '지금 가입하면 수강료 할인 쿠폰 즉시 지급!',
        imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80',
        linkUrl: '/signup',
        displayOrder: 2,
        isActive: true,
        createdDate: '2025-01-10'
    },
    {
        id: 3,
        title: '겨울방학 특강 오픈',
        description: '방학 동안 실력 업그레이드! 단기 완성 코스',
        imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
        linkUrl: '/lectures?category=special',
        displayOrder: 3,
        isActive: false,
        createdDate: '2024-11-15'
    }
];
