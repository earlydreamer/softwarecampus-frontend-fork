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
    academyId: number;
    academyName: string;
    categoryId: number;
    categoryName: string;
    categoryType: 'EMPLOYEE' | 'JOB_SEEKER';

    recruitStart: string; // LocalDate -> ISO string
    recruitEnd: string;
    courseStart: string;
    courseEnd: string;

    cost: number;
    classDay: string;
    location: string;

    kdt: boolean;
    nailbaeum: boolean;
    offline: boolean;

    requirement: string;

    approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    approvedAt?: string; // LocalDateTime -> ISO string
    rating?: number;
    reviewCount?: number;
}

export interface ApiCourseDetailResponse extends ApiCourseResponse {
    curriculums: ApiCourseCurriculum[];
}

export interface ApiCourseCurriculum {
    chapterNumber: number;
    chapterName: string;
    chapterDetail: string;
    chapterTime: number;
}

/**
 * 과정 리뷰 섹션 타입
 */
export type ReviewSectionType = 'CURRICULUM' | 'COURSEWARE' | 'INSTRUCTOR' | 'EQUIPMENT' | 'OTHER';

/**
 * 리뷰 섹션 응답 DTO (ReviewSectionResponse)
 */
export interface ApiReviewSectionResponse {
    sectionType: ReviewSectionType;
    score: number;
    comment?: string;
}

/**
 * 리뷰 첨부파일 응답 DTO (ReviewAttachmentResponse)
 */
export interface ApiReviewAttachmentResponse {
    id: number;
    originalFileName: string;
    downloadUrl: string;
    fileSize: number;
    contentType: string;
    uploadedAt: string;
}

/**
 * 과정 리뷰 응답 DTO (CourseReviewResponse)
 */
export interface ApiCourseReviewResponse {
    reviewId: number;
    writerId: number;
    writerName: string; // 백엔드에서 제공
    courseId: number;
    comment: string;
    approvalStatus: 'APPROVED' | 'PENDING' | 'REJECTED';
    averageScore: number;
    sections: ApiReviewSectionResponse[];
    attachments: ApiReviewAttachmentResponse[];
    likeCount: number;
    dislikeCount: number;
    myLikeType?: string; // 추가: 내 좋아요 상태 (LIKE, DISLIKE, NONE)
    createdAt: string; // 백엔드에서 제공 (ISO 8601)
}

/**
 * 기관 응답 DTO (AcademyResponse)
 * 백엔드 DTO 필드명: isApproved (ApprovalStatus)
 */
export interface ApiAcademyResponse {
    id: number;
    name: string;
    address: string;
    businessNumber: string;
    email: string;
    isApproved: 'PENDING' | 'APPROVED' | 'REJECTED'; // 백엔드 필드명
    approvedAt?: string;
    createdAt: string;
    updatedAt: string;
    attachedFiles: ApiAcademyFileInfo[];
    courseCount?: number;
    rating?: number;
    reviewCount?: number;
}

export interface ApiAcademyFileInfo {
    id: number;
    originalFileName: string;
    downloadUrl: string;
    fileSize: number;
    contentType: string;
    uploadedAt: string;
}

/**
 * 기관 Q&A 응답 DTO (QAResponse)
 */
export interface ApiAcademyQAResponse {
    id: number;
    title: string;
    questionText: string;
    answerText?: string;
    createdAt: string;
    updatedAt: string;
    academyId: number;
    accountId: number;
    writerName: string;
    answeredById?: number;
    answeredByName?: string;
    isAnswered: boolean;
}

/**
 * 과정 Q&A 응답 DTO (QnaResponse)
 */
export interface ApiCourseQnaResponse {
    id: number;
    title: string;
    questionText: string;
    answerText?: string;
    accountId: number;
    writerName: string;
    answeredById?: number;
    answeredByName?: string;
    isAnswered: boolean;
    createdAt: string;
    updatedAt: string;
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
    accountId: number;
    commentCount: number;
    createdAt: string;
}

/**
 * 게시글 상세 응답 DTO (BoardResponseDTO)
 */
export interface ApiBoardResponseDTO {
    id: number;
    category: 'NOTICE' | 'QUESTION' | 'COURSE_STORY' | 'CODING_STORY';
    title: string;
    text: string;
    secret: boolean;
    hits: number;
    likeCount: number;
    createdAt: string;
    accountId: number;
    userNickName: string;
    like: boolean;
    owner: boolean;
    boardAttachs: ApiBoardAttachDTO[];
    boardComments: ApiCommentDTO[];
}

export interface ApiBoardAttachDTO {
    id: number;
    originalFile: string;
    savedFile: string;
    fileSize: number;
}

export interface ApiCommentDTO {
    id: number;
    accountId: number;
    userNickName: string;
    text: string;
    createdAt: string;
    subComments: ApiCommentDTO[];
}

/**
 * 커뮤니티 포스트 (프론트엔드용 - 레거시 호환성 유지)
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
