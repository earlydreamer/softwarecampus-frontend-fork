import apiClient from './api/client';
import type { Course, CategoryType, CourseCategory, Academy, ApprovalStatus } from '../types/index';
import type { ApiCourseResponse } from './api/types';
import { formatCourseDuration } from '../utils/dateUtils';

const DEFAULT_COURSE_IMAGE = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60';

// Helper to map DTO to Course (Frontend Type)
const mapDtoToCourse = (dto: ApiCourseResponse): Course => {
    return {
        id: dto.id,
        name: dto.name,
        academy: {
            id: Math.floor(Math.random() * 1000000), // Placeholder: Random ID to avoid key errors
            name: dto.academyName,
            address: '',
            businessNumber: '',
            email: '',
            isApproved: 'APPROVED',
        } as Academy,
        category: {
            id: Math.floor(Math.random() * 1000000), // Placeholder: Random ID to avoid key errors
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
        isKdt: dto.isKdt,
        isNailbaeum: dto.isNailbaeum,
        isOffline: dto.isOffline,
        requirement: dto.requirement,
        isApproved: dto.approvalStatus as ApprovalStatus,
        approvedAt: dto.approvedAt,

        // UI fields (Default values or mapped)
        rating: 0, // Backend does not provide rating yet
        reviewCount: 0, // Backend does not provide review count yet
        imageUrl: DEFAULT_COURSE_IMAGE, // Placeholder image
        description: dto.requirement,
        format: dto.isOffline ? '오프라인' : '온라인',
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
        const params = keyword ? { keyword } : undefined;

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

    // Client-side filtering
    let mappedCourses = courses.map(mapDtoToCourse);

    if (isOffline !== undefined) {
        mappedCourses = mappedCourses.filter(c => c.isOffline === isOffline);
    }

    // Filter by categoryName if provided (e.g. '웹개발', '백엔드')
    if (filters?.category) {
        mappedCourses = mappedCourses.filter(c => c.category.categoryName === filters.category);
    }

    return mappedCourses;
};

// Re-export other mock functions for now until implemented
export { fetchCourseById, fetchCourseReviews, fetchCourseQnAs } from './mockData';
