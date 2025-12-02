import apiClient from './api/client';
import type {
    CourseApprovalRequest,
    ReviewApprovalRequest,
    BannerData,
    AdminUser,
    AdminAcademy,
    CategoryType
} from '../types';

// 대시보드 통계 응답 타입
export interface DashboardStats {
    totalUsers: number;
    totalCourses: number;
    totalReviews: number;
    pendingCourses: number;
    pendingReviews: number;
}

// 백엔드 카테고리 응답 타입
export interface CourseCategoryResponse {
    id: number;
    categoryName: string;
    categoryType: CategoryType;
}

// 백엔드 배너 응답 타입
interface ApiBannerResponse {
    id: number;
    title: string;
    imageUrl: string;
    linkUrl: string;
    sequence: number;
    isActivated: boolean;
    createdAt: string;
    updatedAt: string;
}

// 백엔드 과정 응답 타입 (CourseResponseDTO)
interface ApiCourseResponse {
    id: number;
    name: string;
    academyId: number;
    academyName: string;
    requesterId?: number;    // 등록자 ID (기관 담당자)
    requesterName?: string;  // 등록자 이름 (기관 담당자)
    categoryId: number;
    categoryName: string;
    categoryType: string;
    recruitStart: string;
    recruitEnd: string;
    courseStart: string;
    courseEnd: string;
    cost: number;
    location: string;
    classDay: string;
    requirement: string;
    offline: boolean;
    kdt: boolean;
    nailbaeum: boolean;
    approvalStatus: string;
    approvedAt: string;
    createdAt: string;
}

// 백엔드 리뷰 응답 타입 (CourseReviewResponse)
interface ApiReviewResponse {
    reviewId: number;
    writerId: number;
    writerName: string;
    courseId: number;
    courseName: string; // 백엔드에서 제공하는 과정 이름
    comment: string;
    approvalStatus: string;
    averageScore: number;
    likeCount: number;
    dislikeCount: number;
    createdAt: string;
    academyId: number;
}

// 페이지네이션 파라미터 타입
interface PaginationParams {
    page: number;
    size: number;
    sort: string;
    status?: string;
    keyword?: string;
    categoryType?: CategoryType;
}

// API 사용자 응답 타입
interface ApiUserResponse {
    id: number;
    userName: string;
    email: string;
    accountType: string;
    createdAt: string;
    lastLoginAt?: string;
    accountApproved: string;
    deletedAt?: string;
    postCount: number;
    commentCount: number;
}

// API 기관 응답 타입
interface ApiAcademyResponse {
    id: number;
    name: string;
    businessNumber: string;
    phoneNumber?: string;
    email: string;
    address: string;
    isApproved: string;
    createdAt: string;
    courseCount?: number;
}

/**
 * 과정 카테고리 목록 조회
 * @param categoryType 카테고리 타입 필터 (옵션)
 */
export const getCourseCategories = async (
    categoryType?: CategoryType
): Promise<CourseCategoryResponse[]> => {
    const params: Partial<Pick<PaginationParams, 'categoryType'>> = {};
    if (categoryType) params.categoryType = categoryType;

    const response = await apiClient.get<CourseCategoryResponse[]>(
        '/courses/categories',
        { params }
    );
    return response.data;
};

/**
 * 대시보드 통계 조회
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
    const response = await apiClient.get<DashboardStats>('/admin/dashboard/stats');
    return response.data;
};

/**
 * 과정 승인 요청 목록 조회
 */
export const getCourseApprovalRequests = async (
    status?: 'PENDING' | 'APPROVED' | 'REJECTED',
    keyword?: string,
    page: number = 1,
    size: number = 20
): Promise<{ requests: CourseApprovalRequest[]; totalCount: number }> => {
    const params: Partial<PaginationParams> = {
        page: page - 1,
        size,
        sort: 'createdAt,desc'
    };
    if (status) params.status = status;
    if (keyword) params.keyword = keyword;

    const response = await apiClient.get<{ content: ApiCourseResponse[]; totalElements: number }>(
        '/admin/courses',
        { params }
    );

    const requests = response.data.content.map(mapApiCourseToApprovalRequest);

    return { requests, totalCount: response.data.totalElements };
};

/**
 * 과정 승인 (기존 API 사용)
 */
export const approveCourse = async (courseId: number): Promise<void> => {
    await apiClient.post(`/courses/${courseId}/approve`);
};

/**
 * 과정 거부
 */
export const rejectCourse = async (courseId: number, reason: string): Promise<void> => {
    await apiClient.post(`/admin/courses/${courseId}/reject`, { reason });
};

/**
 * 리뷰 승인 요청 목록 조회
 */
export const getReviewApprovalRequests = async (
    status?: 'PENDING' | 'APPROVED' | 'REJECTED',
    keyword?: string,
    page: number = 1,
    size: number = 20
): Promise<{ requests: ReviewApprovalRequest[]; totalCount: number }> => {
    const params: Partial<PaginationParams> = {
        page: page - 1,
        size,
        sort: 'createdAt,desc'
    };
    if (status) params.status = status;
    if (keyword) params.keyword = keyword;

    const response = await apiClient.get<{ content: ApiReviewResponse[]; totalElements: number }>(
        '/admin/reviews',
        { params }
    );

    const requests = response.data.content.map(mapApiReviewToApprovalRequest);

    return { requests, totalCount: response.data.totalElements };
};

/**
 * 리뷰 승인
 */
export const approveReview = async (reviewId: number): Promise<void> => {
    await apiClient.post(`/admin/reviews/${reviewId}/approve`);
};

/**
 * 리뷰 거부
 */
export const rejectReview = async (reviewId: number, reason: string): Promise<void> => {
    await apiClient.post(`/admin/reviews/${reviewId}/reject`, { reason });
};

/**
 * 관리자용 배너 목록 조회
 */
export const getAdminBanners = async (): Promise<BannerData[]> => {
    const response = await apiClient.get<ApiBannerResponse[]>('/admin/banners');
    return response.data.map(banner => ({
        id: banner.id,
        title: banner.title,
        imageUrl: banner.imageUrl,
        linkUrl: banner.linkUrl,
        displayOrder: banner.sequence,
        isActive: banner.isActivated,
        createdDate: banner.createdAt,
    }));
};

/**
 * 배너 순서 변경
 */
export const updateBannerOrder = async (bannerId: number, newOrder: number): Promise<void> => {
    await apiClient.patch(`/admin/banners/${bannerId}/order`, null, {
        params: { newOrder }
    });
};

/**
 * 배너 활성화 토글
 */
export const toggleBannerActivation = async (bannerId: number): Promise<void> => {
    await apiClient.patch(`/admin/banners/${bannerId}/toggle`);
};

/**
 * 배너 삭제
 */
export const deleteBanner = async (bannerId: number): Promise<void> => {
    await apiClient.delete(`/admin/banners/${bannerId}`);
};

// Helper: 상태 매핑
const mapStatus = (status: string): '대기' | '승인' | '거부' => {
    switch (status) {
        case 'APPROVED': return '승인';
        case 'REJECTED': return '거부';
        default: return '대기';
    }
};

/**
 * 관리자용 사용자 목록 조회 (검색 지원)
 */
export const getAdminUsers = async (
    keyword?: string,
    page: number = 1,
    size: number = 20
): Promise<{ users: AdminUser[]; totalCount: number }> => {
    const params: Partial<PaginationParams> = {
        page: page - 1,
        size,
        sort: 'createdAt,desc'
    };
    if (keyword) params.keyword = keyword;

    const response = await apiClient.get<{ content: ApiUserResponse[]; totalElements: number }>(
        '/admin/accounts',
        { params }
    );

    const users = response.data.content.map(user => ({
        id: user.id,
        userName: user.userName,
        email: user.email,
        accountType: user.accountType,
        registeredDate: user.createdAt,
        lastLogin: user.lastLoginAt || '-',
        status: user.accountApproved === 'APPROVED' ? '활성' : (user.deletedAt ? '탈퇴' : '정지'),
        postCount: user.postCount,
        commentCount: user.commentCount
    } as AdminUser));

    return { users, totalCount: response.data.totalElements };
};

/**
 * 관리자용 기관 목록 조회 (검색 및 상태 필터링 지원)
 */
export const getAdminAcademies = async (
    status?: 'PENDING' | 'APPROVED' | 'REJECTED',
    keyword?: string,
    page: number = 1,
    size: number = 20
): Promise<{ academies: AdminAcademy[]; totalCount: number }> => {
    const params: Partial<PaginationParams> = {
        page: page - 1,
        size,
        sort: 'createdAt,desc'
    };
    if (status) params.status = status;
    if (keyword) params.keyword = keyword;

    const response = await apiClient.get<{ content: ApiAcademyResponse[]; totalElements: number }>(
        '/admin/academies',
        { params }
    );

    const academies = response.data.content.map(academy => ({
        id: academy.id,
        name: academy.name,
        businessNumber: academy.businessNumber,
        phone: academy.phoneNumber || '-',
        email: academy.email,
        address: academy.address,
        status: academy.isApproved === 'APPROVED' ? '활성' : (academy.isApproved === 'PENDING' ? '대기' : '정지'),
        registeredDate: academy.createdAt,
        courseCount: academy.courseCount || 0,
    } as AdminAcademy));

    return { academies, totalCount: response.data.totalElements };
};

/**
 * 기관 승인
 */
export const approveAcademy = async (academyId: number): Promise<void> => {
    await apiClient.patch(`/admin/academies/${academyId}/approve`);
};

/**
 * 기관 거부
 */
export const rejectAcademy = async (academyId: number, reason: string): Promise<void> => {
    await apiClient.patch(`/admin/academies/${academyId}/reject`, { reason });
};

/**
 * 기관용 대시보드 통계 조회
 */
export const getInstitutionDashboardStats = async (): Promise<DashboardStats> => {
    const response = await apiClient.get<DashboardStats>('/api/institution/dashboard/stats');
    return response.data;
};

/**
 * 기관용 과정 목록 조회
 */
export const getInstitutionCourses = async (
    status?: 'PENDING' | 'APPROVED' | 'REJECTED',
    keyword?: string,
    page: number = 1,
    size: number = 20
): Promise<{ requests: CourseApprovalRequest[]; totalCount: number }> => {
    const params: Partial<PaginationParams> = {
        page: page - 1,
        size,
        sort: 'createdAt,desc'
    };
    if (status) params.status = status;
    if (keyword) params.keyword = keyword;

    const response = await apiClient.get<{ content: ApiCourseResponse[]; totalElements: number }>(
        '/api/institution/courses',
        { params }
    );

    const requests = response.data.content.map(mapApiCourseToApprovalRequest);

    return { requests, totalCount: response.data.totalElements };
};

/**
 * 기관용 리뷰 목록 조회
 */
export const getInstitutionReviews = async (
    status?: 'PENDING' | 'APPROVED' | 'REJECTED',
    keyword?: string,
    page: number = 1,
    size: number = 20
): Promise<{ requests: ReviewApprovalRequest[]; totalCount: number }> => {
    const params: Partial<PaginationParams> = {
        page: page - 1,
        size,
        sort: 'createdAt,desc'
    };
    if (status) params.status = status;
    if (keyword) params.keyword = keyword;

    const response = await apiClient.get<{ content: ApiReviewResponse[]; totalElements: number }>(
        '/api/institution/reviews',
        { params }
    );

    const requests = response.data.content.map(mapApiReviewToApprovalRequest);

    return { requests, totalCount: response.data.totalElements };
};

/**
 * 과정 등록 요청 DTO (백엔드 CourseRequestDTO와 일치)
 */
export interface CourseRegistrationRequest {
    academyId: number;
    categoryType: 'EMPLOYEE' | 'JOB_SEEKER';
    categoryName: string;
    name: string;
    recruitStart?: string;
    recruitEnd?: string;
    courseStart?: string;
    courseEnd?: string;
    cost?: number;
    classDay?: string;
    location?: string;
    isKdt?: boolean;
    isNailbaeum?: boolean;
    isOffline?: boolean;
    requirement?: string;
}

/**
 * 프론트엔드 폼 데이터를 백엔드 DTO로 변환하는 헬퍼 함수
 * 카테고리는 이제 동적으로 로드되므로 직접 사용
 */
export const convertFormToRequest = (
    formData: {
        courseName?: string;
        category?: string;
        target?: string;
        format?: string;
        recruitStart?: string;
        recruitEnd?: string;
        courseStart?: string;
        courseEnd?: string;
        cost?: number;
        classDay?: string;
        isKdt?: boolean;
        isNailbaeum?: boolean;
        isOffline?: boolean;
        location?: string;
        description?: string;
    },
    academyId: number
): CourseRegistrationRequest => {
    // 대상(target)에 따라 categoryType 결정
    const categoryType: 'EMPLOYEE' | 'JOB_SEEKER' = formData.target === '재직자' ? 'EMPLOYEE' : 'JOB_SEEKER';

    // 카테고리명은 이제 백엔드에서 직접 가져온 값을 사용
    const categoryName = formData.category || '';

    return {
        academyId,
        categoryType,
        categoryName,
        name: formData.courseName || '',
        recruitStart: formData.recruitStart,
        recruitEnd: formData.recruitEnd,
        courseStart: formData.courseStart,
        courseEnd: formData.courseEnd,
        cost: formData.cost,
        classDay: formData.classDay, // 수업 요일 (백엔드 기본값: 평일)
        location: formData.location,
        isKdt: formData.isKdt,
        isNailbaeum: formData.isNailbaeum,
        isOffline: formData.isOffline ?? (formData.format === '오프라인'),
        requirement: formData.description,
    };
};

/**
 * 과정 등록 요청 (기관용 - PENDING 상태로 생성)
 */
export const requestCourseRegistration = async (courseData: CourseRegistrationRequest): Promise<CourseApprovalRequest> => {
    const response = await apiClient.post<ApiCourseResponse>('/courses/request', courseData);

    // 응답 데이터를 프론트엔드 타입으로 변환
    const course = response.data;
    return mapApiCourseToApprovalRequest(course);
};

/**
 * 과정 직접 등록 (관리자용 - 즉시 APPROVED 상태로 생성)
 */
export const createCourseByAdmin = async (courseData: CourseRegistrationRequest): Promise<CourseApprovalRequest> => {
    const response = await apiClient.post<ApiCourseResponse>('/courses', courseData);

    const course = response.data;
    return mapApiCourseToApprovalRequest(course);
};

/**
 * 과정 수정 요청 (기관용)
 */
export const updateCourseRequest = async (
    courseId: number,
    courseData: CourseRegistrationRequest
): Promise<CourseApprovalRequest> => {
    const response = await apiClient.put<ApiCourseResponse>(`/courses/${courseId}`, courseData);

    const course = response.data;
    return mapApiCourseToApprovalRequest(course);
};

// 과정 이미지 응답 타입
export interface CourseImageUploadResponse {
    id: number;
    originalFileName: string;
    storedFileName: string;
    downloadUrl: string;
    thumbnailUrl: string | null;
    fileSize: number;
    contentType: string;
    isThumbnail: boolean;
    createdAt: string;
}

/**
 * 과정 이미지 업로드
 * @param categoryType 카테고리 타입 (EMPLOYEE/JOB_SEEKER)
 * @param courseId 과정 ID
 * @param file 업로드할 이미지 파일
 * @param isThumbnail 썸네일 여부
 */
export const uploadCourseImage = async (
    categoryType: CategoryType,
    courseId: number,
    file: File,
    isThumbnail: boolean = true
): Promise<CourseImageUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<CourseImageUploadResponse>(
        `/${categoryType}/courses/${courseId}/images`,
        formData,
        {
            params: { isThumbnail },
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );

    return response.data;
};

/**
 * 배너 생성
 */
export const createBanner = async (bannerData: FormData): Promise<BannerData> => {
    const response = await apiClient.post<ApiBannerResponse>('/admin/banners', bannerData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return {
        id: response.data.id,
        title: response.data.title,
        imageUrl: response.data.imageUrl,
        linkUrl: response.data.linkUrl,
        displayOrder: response.data.sequence,
        isActive: response.data.isActivated,
        createdDate: response.data.createdAt,
    };
};

/**
 * 배너 수정
 */
export const updateBanner = async (bannerId: number, bannerData: FormData): Promise<BannerData> => {
    const response = await apiClient.put<ApiBannerResponse>(`/admin/banners/${bannerId}`, bannerData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return {
        id: response.data.id,
        title: response.data.title,
        imageUrl: response.data.imageUrl,
        linkUrl: response.data.linkUrl,
        displayOrder: response.data.sequence,
        isActive: response.data.isActivated,
        createdDate: response.data.createdAt,
    };
};

// Helper: 과정 응답 매핑
const mapApiCourseToApprovalRequest = (course: ApiCourseResponse): CourseApprovalRequest => ({
    id: course.id,
    courseName: course.name,
    academyId: course.academyId,
    academyName: course.academyName,
    requesterId: course.requesterId,
    requesterName: course.requesterName,
    category: course.categoryName,
    target: course.categoryType === 'EMPLOYEE' ? '재직자' : '취업예정자',
    format: course.offline ? '오프라인' : '온라인',
    requestType: '등록',
    requestDate: course.createdAt,
    status: mapStatus(course.approvalStatus),
    recruitStart: course.recruitStart,
    recruitEnd: course.recruitEnd,
    courseStart: course.courseStart,
    courseEnd: course.courseEnd,
    cost: course.cost,
    isKdt: course.kdt,
    isNailbaeum: course.nailbaeum,
    isOffline: course.offline,
    location: course.location,
    description: course.requirement,
});

// Helper: 리뷰 응답 매핑
const mapApiReviewToApprovalRequest = (review: ApiReviewResponse): ReviewApprovalRequest => ({
    id: review.reviewId,
    reviewId: review.reviewId,
    courseName: review.courseName,
    academyId: review.academyId,
    writerName: review.writerName,
    rating: review.averageScore,
    comment: review.comment,
    requestType: '등록',
    requestDate: review.createdAt,
    status: mapStatus(review.approvalStatus),
});
