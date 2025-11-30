import apiClient from './api/client';
import type { Course, CategoryType, CourseCategory, Academy, ApprovalStatus, CourseQna, CourseReview } from '../types/index';
import type { ApiCourseResponse, ApiCourseDetailResponse, ApiCourseQnaResponse, ApiCourseReviewResponse } from './api/types';
import { formatCourseDuration } from '../utils/dateUtils';

const DEFAULT_COURSE_IMAGE = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60';

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
            name: dto.categoryType === 'EMPLOYEE' ? '재직자' : '취업예정자',
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

        // UI fields (Default values or mapped)
        rating: 0, // Backend does not provide rating yet
        reviewCount: 0, // Backend does not provide review count yet
        imageUrl: DEFAULT_COURSE_IMAGE, // Placeholder image
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
}

export const fetchCourses = async (filters?: CourseFilterParams): Promise<Course[]> => {
    const { categoryType, categoryId, keyword, isOffline } = filters || {};

    let courses: ApiCourseResponse[] = [];

    try {
        // 백엔드 리팩토링: /api/courses with query params
        const params: any = {};
        if (keyword) params.keyword = keyword;
        if (categoryId) params.categoryId = categoryId;
        if (categoryType && categoryType !== 'ALL') params.categoryType = categoryType;
        if (isOffline !== undefined) params.isOffline = isOffline;

        console.log(`[fetchCourses] Requesting /api/courses with params:`, params);

        const response = await apiClient.get<ApiCourseResponse[]>(`/api/courses`, { params });
        courses = response.data;
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

export const fetchCourseQnAs = async (
    courseId: number,
    page: number = 1,
    limit: number = 5,
    keyword?: string
): Promise<{ qnas: CourseQna[], totalCount: number }> => {
    try {
        // 백엔드 API 파라미터 준비
        const params: any = {
            page: page - 1,
            size: limit,
        };
        if (keyword) {
            params.keyword = keyword;
        }

        // 백엔드 리팩토링: /api/courses/{courseId}/qna
        const response = await apiClient.get<any>(`/api/courses/${courseId}/qna`, { params });

        const content = response.data.content as ApiCourseQnaResponse[];
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
            writerId: review.writerId,
            writerName: review.writerName, // 백엔드에서 제공
            averageScore: review.averageScore,
            sections: review.sections || [],
            comment: review.comment,
            attachments: review.attachments || [],
            likeCount: review.likeCount,
            dislikeCount: review.dislikeCount,
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
