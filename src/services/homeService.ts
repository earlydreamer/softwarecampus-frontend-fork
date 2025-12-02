// ===== API 연동 서비스 =====
// 과정 섹션: 최적화된 단일 API 사용

import { fetchActiveBanners } from './bannerService';
import apiClient from './api/client';
import type { Course } from '../types';

// API 응답 타입 정의
interface ApiCourseListResponse {
    id: number;
    name: string;
    academyName: string;
    categoryName: string;
    categoryType: 'EMPLOYEE' | 'JOB_SEEKER';
    recruitStart: string;
    recruitEnd: string;
    courseStart: string;
    courseEnd: string;
    cost: number;
    location: string;
    isKdt: boolean;
    isNailbaeum: boolean;
    isOffline: boolean;
    imageUrl?: string;
    rating?: number;
    reviewCount?: number;
}

interface HomeCoursesResponse {
    employeeBest: ApiCourseListResponse[];
    jobSeekerBest: ApiCourseListResponse[];
    closingSoon: ApiCourseListResponse[];
}

/**
 * 배너 조회 (실제 API)
 */
export const fetchHomeBanners = fetchActiveBanners;

/**
 * 홈 화면 과정 섹션 데이터 조회 (최적화된 단일 API)
 * - 한 번의 요청으로 모든 섹션 데이터 조회
 * - 백엔드에서 최적화된 DTO 사용
 */
export const fetchHomeCourseSections = async () => {
    try {
        const response = await apiClient.get<HomeCoursesResponse>('/api/home/courses');

        // API 응답을 프론트엔드 Course 타입으로 변환
        const convertToCourse = (apiCourse: ApiCourseListResponse): Course => ({
            id: apiCourse.id,
            academy: {
                id: 0,
                name: apiCourse.academyName,
                address: '',
                businessNumber: '',
                email: '',
                approvalStatus: 'APPROVED',
                approvedAt: '',
            },
            category: {
                id: 0,
                categoryName: apiCourse.categoryName,
                categoryType: apiCourse.categoryType,
                name: apiCourse.categoryType === 'EMPLOYEE' ? '재직자' : '취업예정자',
            },
            name: apiCourse.name,
            recruitStart: apiCourse.recruitStart,
            recruitEnd: apiCourse.recruitEnd,
            courseStart: apiCourse.courseStart,
            courseEnd: apiCourse.courseEnd,
            cost: apiCourse.cost,
            classDay: '',
            location: apiCourse.location,
            kdt: apiCourse.isKdt,
            nailbaeum: apiCourse.isNailbaeum,
            offline: apiCourse.isOffline,
            requirement: '',
            approvalStatus: 'APPROVED',

            // 프론트엔드 전용 필드
            duration: calculateDuration(apiCourse.courseStart, apiCourse.courseEnd),
            format: apiCourse.isOffline ? '오프라인' : '온라인',
            rating: apiCourse.rating || 0,
            reviewCount: apiCourse.reviewCount || 0,
            tags: [],
            imageUrl: apiCourse.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            description: `${apiCourse.name} 과정입니다.`,
            highlights: [],
        });

        return {
            employeeBest: response.data.employeeBest.map(convertToCourse),
            jobSeekerBest: response.data.jobSeekerBest.map(convertToCourse),
            closingSoon: response.data.closingSoon.map(convertToCourse),
        };
    } catch (error) {
        console.error('과정 섹션 데이터 조회 실패:', error);
        throw error;
    }
};

/**
 * 커뮤니티 하이라이트 조회 (실제 API)
 */
export { fetchCommunityHighlights } from './api/homeApi';

/**
 * 과정 기간 계산 (개월 수)
 */
function calculateDuration(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const months = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
    return `${months}개월`;
}
