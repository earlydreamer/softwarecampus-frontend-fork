import apiClient from './api/client';
import type { Course, CategoryType, CourseCategory, Academy, ApprovalStatus, CourseQna } from '../types/index';
import type { ApiCourseResponse, ApiCourseDetailResponse, ApiCourseQnaResponse } from './api/types';
import { formatCourseDuration } from '../utils/dateUtils';

const DEFAULT_COURSE_IMAGE = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60';

// Helper to map DTO to Course (Frontend Type)
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
            isApproved: 'APPROVED',
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
        isKdt: dto.kdt,
        isNailbaeum: dto.nailbaeum,
        isOffline: dto.offline,
        requirement: dto.requirement,
        isApproved: dto.approvalStatus as ApprovalStatus,
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
    category?: string;
    categoryType?: CategoryType | 'ALL';
    isOffline?: boolean;
}

export const fetchCourses = async (filters?: CourseFilterParams): Promise<Course[]> => {
    const { categoryType, keyword, isOffline } = filters || {};

    let courses: ApiCourseResponse[] = [];

    try {
        const pathSuffix = keyword ? '/search' : '';
        // 백엔드 필터링 파라미터 전달
        const params: any = {};
        if (keyword) params.keyword = keyword;
        if (isOffline !== undefined) params.isOffline = isOffline;

        console.log(`[fetchCourses] Requesting with params:`, params);

        if (!categoryType || categoryType === 'ALL') {
            const [employeeRes, jobSeekerRes] = await Promise.all([
                apiClient.get<ApiCourseResponse[]>(`/api/EMPLOYEE/course${pathSuffix}`, { params }),
                apiClient.get<ApiCourseResponse[]>(`/api/JOB_SEEKER/course${pathSuffix}`, { params })
            ]);
            courses = [...employeeRes.data, ...jobSeekerRes.data];
        } else {
            const response = await apiClient.get<ApiCourseResponse[]>(`/api/${categoryType}/course${pathSuffix}`, { params });
            courses = response.data;
        }
    } catch (error) {
        console.error('Failed to fetch courses:', error);
        throw error;
    }

    // Map DTO to Frontend Model
    let mappedCourses = courses.map(mapDtoToCourse);

    // Filter by categoryName if provided (e.g. '웹개발', '백엔드')
    // 상세 카테고리 필터링은 아직 백엔드 API가 없으므로 클라이언트에서 유지
    if (filters?.category) {
        mappedCourses = mappedCourses.filter(c => c.category.categoryName === filters.category);
    }

    return mappedCourses;
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
    keyword?: string,
    categoryType: CategoryType = 'EMPLOYEE'
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

        // 백엔드 API: /api/{type}/course/{courseId}/qna (Page<QnaResponse> 반환)
        const response = await apiClient.get<any>(`/api/${categoryType}/course/${courseId}/qna`, { params });

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

// Re-export other mock functions for now until implemented
export { fetchCourseReviews } from './mockData';
