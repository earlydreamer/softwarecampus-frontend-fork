import apiClient from './api/client';
import type { Course, CategoryType, CourseCategory, Academy, ApprovalStatus, CourseQna, CourseReview } from '../types/index';
import type { ApiCourseResponse, ApiCourseDetailResponse, ApiCourseQnaResponse, ApiCourseReviewResponse } from './api/types';
import { formatCourseDuration } from '../utils/dateUtils';
import { DEFAULT_IMAGES } from '../constants';
import { categoryTypeToTarget } from '../utils/categoryType';

// Helper to map DTO to Course (Frontend Type)
const mapDtoToCourse = (dto: ApiCourseResponse): Course => {
    return {
        id: dto.id,
        name: dto.name,
        academy: {
            id: dto.academyId,
            name: dto.academyName,
            address: '',
            businessNumber: '',
            email: '',
            approvalStatus: 'APPROVED',
        } as Academy,
        category: {
            id: dto.categoryId,
            categoryName: dto.categoryName,
            categoryType: dto.categoryType as CategoryType,
            name: categoryTypeToTarget(dto.categoryType),
        } as CourseCategory,
        recruitStart: dto.recruitStart,
        recruitEnd: dto.recruitEnd,
        courseStart: dto.courseStart,
        courseEnd: dto.courseEnd,
        cost: dto.cost,
        classDay: dto.classDay,
        location: dto.location,
        kdt: dto.kdt,
        nailbaeum: dto.nailbaeum,
        offline: dto.offline,
        requirement: dto.requirement,
        approvalStatus: dto.approvalStatus as ApprovalStatus,
        approvedAt: dto.approvedAt,

        // 과정 등록자 정보 (백엔드에서 제공)
        requesterId: dto.requesterId,
        requesterName: dto.requesterName,

        // UI fields (Default values or mapped)
        rating: dto.rating ?? 0,
        reviewCount: dto.reviewCount ?? 0,
        imageUrl: dto.imageUrl && dto.imageUrl.trim() !== '' ? dto.imageUrl : DEFAULT_IMAGES.COURSE_THUMBNAIL, // 썸네일 이미지
        headerImageUrl: dto.headerImageUrl && dto.headerImageUrl.trim() !== '' ? dto.headerImageUrl : DEFAULT_IMAGES.COURSE_HEADER, // 헤더 이미지
        description: dto.requirement,
        format: dto.offline ? '오프라인' : '온라인',
        duration: formatCourseDuration(dto.courseStart, dto.courseEnd),
    };
};

export interface CourseFilterParams {
    keyword?: string;
    categoryId?: number; // 세부 카테고리 ID (예: 33=백엔드)
    categoryType?: CategoryType | 'ALL';
    isOffline?: boolean;
    status?: 'RECRUITING' | 'IN_PROGRESS' | 'ENDED';
}

// 과정 목록 조회 파라미터 타입
interface FetchCoursesParams {
    keyword?: string;
    categoryId?: number;
    categoryType?: string;
    isOffline?: boolean;
    status?: string;
}

export const fetchCourses = async (filters?: CourseFilterParams): Promise<Course[]> => {
    const { categoryType, categoryId, keyword, isOffline, status } = filters || {};

    let courses: ApiCourseResponse[] = [];

    try {
        // 백엔드 리팩토링: /api/courses with query params (Page 응답)
        const params: FetchCoursesParams = {};
        if (keyword) params.keyword = keyword;
        if (categoryId) params.categoryId = categoryId;
        if (categoryType && categoryType !== 'ALL') params.categoryType = categoryType;
        if (isOffline !== undefined) params.isOffline = isOffline;
        if (status) params.status = status;

        console.log(`[fetchCourses] Requesting /api/courses with params:`, params);

        // 백엔드가 Page<CourseResponseDTO>를 반환하므로 content 배열 추출
        const response = await apiClient.get<{ content: ApiCourseResponse[] }>(`/api/courses`, { params });
        courses = response.data.content;
    } catch (error) {
        console.error('Failed to fetch courses:', error);
        throw error;
    }

    // Map DTO to Frontend Model
    return courses.map(mapDtoToCourse);
};

// Helper to map Detail DTO to Course
const mapDetailDtoToCourse = (dto: ApiCourseDetailResponse): Course => {
    const baseCourse = mapDtoToCourse(dto);
    return {
        ...baseCourse,
        curriculums: dto.curriculums.map(c => ({
            chapterNumber: c.chapterNumber,
            chapterName: c.chapterName,
            chapterDetail: c.chapterDetail,
            chapterTime: c.chapterTime,
        })),
    };
};

export const fetchCourseById = async (courseId: number): Promise<Course | null> => {
    try {
        // 백엔드 리팩토링: /api/courses/{id} (type 불필요)
        const response = await apiClient.get<ApiCourseDetailResponse>(`/api/courses/${courseId}`);
        return mapDetailDtoToCourse(response.data);
    } catch (error) {
        console.error(`Failed to fetch course ${courseId}:`, error);
        return null;
    }
};

// Q&A 목록 조회 파라미터 타입
interface FetchQnAsParams {
    page: number;
    size: number;
    keyword?: string;
}

// Q&A 페이지네이션 응답 타입
interface PaginatedQnAResponse {
    content: ApiCourseQnaResponse[];
    totalElements: number;
}

export const fetchCourseQnAs = async (
    courseId: number,
    page: number = 1,
    limit: number = 5,
    keyword?: string
): Promise<{ qnas: CourseQna[], totalCount: number }> => {
    try {
        // 백엔드 API 파라미터 준비
        const params: FetchQnAsParams = {
            page: page - 1,
            size: limit,
        };
        if (keyword) {
            params.keyword = keyword;
        }

        // 백엔드 리팩토링: /api/courses/{courseId}/qna
        const response = await apiClient.get<PaginatedQnAResponse>(`/api/courses/${courseId}/qna`, { params });

        const content = response.data.content;
        const totalElements = response.data.totalElements;

        const qnas = content.map(qna => ({
            id: qna.id,
            courseId: courseId,
            accountId: qna.accountId,
            writerName: qna.writerName,
            title: qna.title,
            questionText: qna.questionText,
            isAnswered: qna.isAnswered,
            answerText: qna.answerText,
            answeredById: qna.answeredById,
            answeredByName: qna.answeredByName,
            createdAt: qna.createdAt,
            updatedAt: qna.updatedAt,
            viewCount: 0,
            files: qna.files?.map(f => ({
                id: f.id,
                originName: f.originName,
                fileUrl: f.fileUrl,
            })) || [],
        }));

        return { qnas, totalCount: totalElements };
    } catch (error) {
        console.error(`Failed to fetch QnAs for course ${courseId}:`, error);
        return { qnas: [], totalCount: 0 };
    }
};

/**
 * 과정 리뷰 조회 (백엔드 API - Page 객체)
 * @param courseId - 과정 ID
 * @param page - 페이지 번호 (1부터 시작, 백엔드로 전달 시 0-based로 변환)
 * @param size - 페이지 크기
 */
export const fetchCourseReviews = async (
    courseId: number,
    page: number = 1,
    size: number = 10
): Promise<{ reviews: CourseReview[], totalCount: number }> => {
    try {
        // 백엔드: GET /api/courses/{courseId}/reviews?page=0&size=10&sort=createdAt
        // 1-based 페이지를 0-based로 변환하여 전달
        const response = await apiClient.get<{ content: ApiCourseReviewResponse[], totalElements: number }>(
            `/api/courses/${courseId}/reviews`,
            { params: { page: page - 1, size, sort: 'createdAt,desc' } }
        );

        const reviews = response.data.content.map(review => ({
            id: review.reviewId,
            courseId: review.courseId,
            courseName: review.courseName, // 백엔드에서 제공하는 과정명
            writerId: review.writerId,
            writerName: review.writerName, // 백엔드에서 제공
            averageScore: review.averageScore,
            sections: review.sections || [],
            comment: review.comment,
            attachments: review.attachments || [],
            likeCount: review.likeCount,
            dislikeCount: review.dislikeCount,
            myLikeType: review.myLikeType, // 백엔드에서 제공
            approvalStatus: review.approvalStatus as ApprovalStatus,
            createdAt: review.createdAt, // 백엔드에서 제공 (ISO 8601)
        }));

        const totalCount = response.data.totalElements;

        return { reviews, totalCount };
    } catch (error) {
        console.error(`Failed to fetch reviews for course ${courseId}:`, error);
        return { reviews: [], totalCount: 0 };
    }
};

/**
 * 리뷰 좋아요 토글
 */
export const toggleReviewLike = async (
    courseId: number,
    reviewId: number,
    likeType: 'LIKE' | 'DISLIKE'
): Promise<{ type: string; likeCount: number; dislikeCount: number }> => {
    try {
        const response = await apiClient.post(
            `/api/courses/${courseId}/reviews/${reviewId}/likes`,
            { type: likeType }
        );
        return response.data;
    } catch (error) {
        console.error(`Failed to toggle like for review ${reviewId}:`, error);
        throw error;
    }
};

/**
 * 수강 후기 작성
 */
export const createCourseReview = async (
    courseId: number,
    data: {
        comment: string;
        sections: { sectionType: string; score: number }[];
    }
): Promise<CourseReview> => {
    try {
        const response = await apiClient.post<ApiCourseReviewResponse>(
            `/api/courses/${courseId}/reviews`,
            data
        );

        // DTO -> Model 변환
        const review = response.data;
        return {
            id: review.reviewId,
            courseId: review.courseId,
            courseName: review.courseName, // 백엔드에서 제공하는 과정명
            writerId: review.writerId,
            writerName: review.writerName,
            averageScore: review.averageScore,
            sections: review.sections || [],
            comment: review.comment,
            attachments: review.attachments || [],
            likeCount: review.likeCount,
            dislikeCount: review.dislikeCount,
            myLikeType: review.myLikeType,
            approvalStatus: review.approvalStatus as ApprovalStatus,
            createdAt: review.createdAt,
        };
    } catch (error) {
        console.error(`Failed to create review for course ${courseId}:`, error);
        throw error;
    }
};

/**
 * 수강 후기 파일 업로드 (수료증 등)
 */
export const uploadReviewFile = async (
    courseId: number,
    reviewId: number,
    file: File
): Promise<void> => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        await apiClient.post(
            `/api/courses/${courseId}/reviews/${reviewId}/file`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
    } catch (error) {
        console.error(`Failed to upload file for review ${reviewId}:`, error);
        throw error;
    }
};

/**
 * 수강 후기 파일 삭제
 */
export const deleteReviewFile = async (
    courseId: number,
    reviewId: number,
    fileId: number
): Promise<void> => {
    try {
        await apiClient.delete(`/api/courses/${courseId}/reviews/${reviewId}/file/${fileId}`);
    } catch (error) {
        console.error(`Failed to delete file ${fileId} for review ${reviewId}:`, error);
        throw error;
    }
};

/**
 * 과정 삭제
 * 관리자 또는 과정 등록자만 삭제 가능
 */
export const deleteCourse = async (courseId: number): Promise<void> => {
    // 유효하지 않은 courseId 검증
    if (!courseId || courseId <= 0) {
        throw new Error('유효하지 않은 과정 ID입니다.');
    }

    try {
        await apiClient.delete(`/api/courses/${courseId}`);
    } catch (error) {
        console.error(`Failed to delete course ${courseId}:`, error);
        throw error;
    }
};

/**
 * 과정 Q&A 질문 등록
 */
export const createCourseQnA = async (
    courseId: number,
    data: {
        title: string;
        questionText: string;
        fileDetails?: { id: number; originName: string; fileUrl: string }[];
    }
): Promise<CourseQna> => {
    try {
        const response = await apiClient.post<ApiCourseQnaResponse>(
            `/api/courses/${courseId}/qna`,
            data
        );

        const qna = response.data;
        return {
            id: qna.id,
            courseId: courseId,
            accountId: qna.accountId,
            writerName: qna.writerName,
            title: qna.title,
            questionText: qna.questionText,
            isAnswered: qna.isAnswered,
            answerText: qna.answerText,
            answeredById: qna.answeredById,
            answeredByName: qna.answeredByName,
            createdAt: qna.createdAt,
            updatedAt: qna.updatedAt,
            viewCount: 0,
            files: qna.files?.map(f => ({
                id: f.id,
                originName: f.originName,
                fileUrl: f.fileUrl,
            })) || [],
        };
    } catch (error) {
        console.error(`Failed to create QnA for course ${courseId}:`, error);
        throw error;
    }
};

/**
 * 과정 Q&A 파일 업로드
 * 백엔드 응답: QnaFileDetail { id: Long, originName: String, fileUrl: String }
 */
export const uploadCourseQnaFile = async (
    courseId: number,
    file: File
): Promise<{ id: number; originName: string; fileUrl: string }> => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post<{ id: number; originName: string; fileUrl: string }>(
            `/api/courses/${courseId}/qna/files/upload`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error(`Failed to upload file for course ${courseId} QnA:`, error);
        throw error;
    }
};
