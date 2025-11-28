/**
 * 백엔드 API 응답 타입 정의
 * 백엔드 DTO 구조와 정확히 매핑
 */

/**
 * 과정 응답 DTO (CourseResponseDTO)
 */
export interface ApiCourseResponse {
    id: number;
    name: string;
    academyName: string;
    categoryName: string;
    categoryType: 'EMPLOYEE' | 'JOB_SEEKER';

    recruitStart: string; // LocalDate -> ISO string
    recruitEnd: string;
    courseStart: string;
    courseEnd: string;

    cost: number;
    classDay: string;
    location: string;

    isKdt: boolean;
    isNailbaeum: boolean;
    isOffline: boolean;

    requirement: string;

    approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    approvedAt?: string; // LocalDateTime -> ISO string
}

/**
 * 게시글 목록 응답 DTO (BoardListResponseDTO)
 */
export interface ApiBoardListResponse {
    id: number;
    category: string;
    title: string;
    secret: boolean;
    userNickName: string;
    like: boolean;
    createdAt: string;
}

/**
 * 커뮤니티 포스트 (프론트엔드용)
 */
export interface CommunityPost {
    id: number;
    title: string;
    account: {
        userName: string;
    };
    likeCount: number;
    viewCount: number;
    commentCount: number;
    category: 'NOTICE' | 'QUESTION' | 'COURSE_STORY' | 'CODING_STORY';
    categoryName: string;
    createdAt: string;
}

/**
 * 커뮤니티 하이라이트 응답 DTO
 */
export interface ApiHomeCommunityResponse {
    id: number;
    title: string;
    category: string;
    categoryName: string;
    writerName: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    createdAt: string;
}
