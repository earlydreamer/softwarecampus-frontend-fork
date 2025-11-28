import apiClient from './client';
import type { ApiCourseResponse, ApiHomeCommunityResponse, CommunityPost } from './types';
import type { Course } from '../../types';

/**
 * 과정 목록 조회
 * @param categoryType - 'EMPLOYEE' | 'JOB_SEEKER'
 * @param limit - 조회할 개수 (기본값 4)
 */
export const fetchCoursesByType = async (
    categoryType: 'EMPLOYEE' | 'JOB_SEEKER',
    limit: number = 4
): Promise<Course[]> => {
    try {
        const response = await apiClient.get<ApiCourseResponse[]>(
            `/api/${categoryType.toLowerCase()}/course`
        );

        // API 응답을 프론트엔드 Course 타입으로 변환
        const courses: Course[] = response.data.slice(0, limit).map(apiCourse => ({
            // 백엔드 필드
            id: apiCourse.id,
            academy: {
                id: 0, // TODO: 백엔드에서 academy 객체 전체를 주지 않으므로 임시 처리
                name: apiCourse.academyName,
                address: '',
                businessNumber: '',
                email: '',
                isApproved: 'APPROVED',
                approvedAt: '',
            },
            category: {
                id: 0, // TODO: category id는 백엔드에서 제공하지 않음
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
            classDay: apiCourse.classDay,
            location: apiCourse.location,
            isKdt: apiCourse.isKdt,
            isNailbaeum: apiCourse.isNailbaeum,
            isOffline: apiCourse.isOffline,
            requirement: apiCourse.requirement,
            isApproved: apiCourse.approvalStatus,

            // 프론트엔드 전용 필드 (기본값 설정)
            duration: calculateDuration(apiCourse.courseStart, apiCourse.courseEnd),
            format: apiCourse.isOffline ? '오프라인' : '온라인',
            rating: 0, // TODO: 리뷰 API 연동 필요
            reviewCount: 0,
            tags: [], // TODO: 태그 정보 필요
            imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // 기본 이미지
            description: `${apiCourse.name} 과정입니다.`,
            highlights: [],
        }));

        return courses;
    } catch (error) {
        console.error('과정 목록 조회 실패:', error);
        throw error;
    }
};

/**
 * 마감 임박 과정 조회
 * 모집 종료일이 가까운 순으로 정렬
 */
export const fetchClosingSoonCourses = async (limit: number = 4): Promise<Course[]> => {
    try {
        // 재직자 + 취업예정자 모두 조회
        const [employeeCourses, jobSeekerCourses] = await Promise.all([
            fetchCoursesByType('EMPLOYEE', 20),
            fetchCoursesByType('JOB_SEEKER', 20),
        ]);

        const allCourses = [...employeeCourses, ...jobSeekerCourses];

        // 현재 날짜
        const now = new Date();

        // 모집 중인 과정만 필터링 (recruitEnd가 아직 안 지난 것)
        const recruitingCourses = allCourses.filter(course => {
            if (!course.recruitEnd) return false; // recruitEnd가 없으면 제외
            const recruitEnd = new Date(course.recruitEnd);
            return recruitEnd >= now;
        });

        // 모집 종료일이 가까운 순으로 정렬
        recruitingCourses.sort((a, b) => {
            if (!a.recruitEnd || !b.recruitEnd) return 0;
            const dateA = new Date(a.recruitEnd);
            const dateB = new Date(b.recruitEnd);
            return dateA.getTime() - dateB.getTime();
        });

        return recruitingCourses.slice(0, limit);
    } catch (error) {
        console.error('마감 임박 과정 조회 실패:', error);
        throw error;
    }
};

/**
 * 커뮤니티 하이라이트 조회
 * 최근 게시글 n개
 */


/**
 * 커뮤니티 하이라이트 조회
 * 최근 게시글 n개
 */
export const fetchCommunityHighlights = async (limit: number = 6): Promise<CommunityPost[]> => {
    try {
        const response = await apiClient.get<ApiHomeCommunityResponse[]>('/api/home/community', {
            params: { limit }
        });

        // API 응답을 CommunityPost 타입으로 변환
        const posts: CommunityPost[] = response.data.map(apiPost => ({
            id: apiPost.id,
            title: apiPost.title,
            account: {
                userName: apiPost.writerName
            },
            likeCount: apiPost.likeCount,
            viewCount: apiPost.viewCount,
            commentCount: apiPost.commentCount,
            category: mapBoardCategory(apiPost.category),
            categoryName: apiPost.categoryName,
            createdAt: apiPost.createdAt,
        }));

        return posts;
    } catch (error) {
        console.error('커뮤니티 하이라이트 조회 실패:', error);
        return [];
    }
};

/**
 * 과정 기간 계산 (개월 수)
 */
function calculateDuration(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const months = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
    return `${months}개월`;
}

/**
 * 게시판 카테고리 매핑
 */
function mapBoardCategory(category: string): 'NOTICE' | 'QUESTION' | 'COURSE_STORY' | 'CODING_STORY' {
    const categoryMap: Record<string, 'NOTICE' | 'QUESTION' | 'COURSE_STORY' | 'CODING_STORY'> = {
        '공지사항': 'NOTICE',
        '문의사항': 'QUESTION',
        '진로이야기': 'COURSE_STORY',
        '코딩이야기': 'CODING_STORY',
        'NOTICE': 'NOTICE',
        'QUESTION': 'QUESTION',
        'COURSE_STORY': 'COURSE_STORY',
        'CODING_STORY': 'CODING_STORY',
    };

    return categoryMap[category] || 'CODING_STORY';
}


