import apiClient from './api/client';
import type {
    CourseApprovalRequest,
    ReviewApprovalRequest,
    BannerData,
    AdminUser,
    AdminAcademy,
    CategoryType
} from '../types';
import { targetToCategoryType, categoryTypeToTarget } from '../utils/categoryType';

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
    capacity?: number; // 모집 정원
    location: string;
    classDay: string;
    requirement: string;
    offline: boolean;
    kdt: boolean;
    nailbaeum: boolean;
    approvalStatus: string;
    rejectionReason?: string; // 거부 사유
    approvedAt: string;
    createdAt: string;
    imageUrl?: string; // 과정 썸네일 이미지 URL
    thumbnailImageId?: number; // 썸네일 이미지 ID (삭제 API용)
    headerImageUrl?: string; // 헤더 이미지 URL
    headerImageId?: number; // 헤더 이미지 ID (삭제 API용)
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
    rejectionReason?: string; // 거부 사유
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

// API 사용자 응답 타입 (백엔드 AccountResponse와 일치)
interface ApiUserResponse {
    id: number;
    email: string;
    userName: string;
    phoneNumber?: string;
    accountType: string;
    approvalStatus: string;  // PENDING, APPROVED, REJECTED
    address?: string;
    affiliation?: string;
    position?: string;
    profileImage?: string;
    createdAt: string;
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
    website?: string;
    email: string;
    address: string;
    isApproved: string;
    createdAt: string;
    courseCount?: number;
    logoUrl?: string;  // 기관 프로필 이미지 URL (작성일: 2025-12-03)
}

/**
 * 과정 카테고리 목록 조회
 * @param categoryType 카테고리 타입 필터 (옵션)
 */
export const getCourseCategories = async (
    categoryType?: CategoryType
): Promise<CourseCategoryResponse[]> => {
    try {
        const params: Partial<Pick<PaginationParams, 'categoryType'>> = {};
        if (categoryType) params.categoryType = categoryType;

        const response = await apiClient.get<CourseCategoryResponse[]>(
            '/api/courses/categories',
            { params }
        );
        
        // 응답이 배열인지 확인 (API 오류 시 HTML 등이 반환될 수 있음)
        if (!Array.isArray(response.data)) {
            console.warn('카테고리 API 응답이 배열이 아닙니다:', typeof response.data);
            return [];
        }
        
        return response.data;
    } catch (error) {
        console.error('카테고리 조회 실패:', error);
        return [];
    }
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
        '/admin/courses/approval-requests',
        { params }
    );

    // 응답 데이터 유효성 검사 + 타입 안전성 강화
    const rawContent = response.data?.content;
    const content = Array.isArray(rawContent) ? rawContent : [];
    if (!Array.isArray(rawContent)) {
        console.warn('[adminService] getCourseApprovalRequests: 예상치 못한 응답 형식', {
            status: response.status,
            keys: Object.keys(response.data || {}),
            contentType: typeof rawContent
        });
    }

    const requests = content.map(mapApiCourseToApprovalRequest);
    const totalElements = typeof response.data?.totalElements === 'number' ? response.data.totalElements : 0;

    return { requests, totalCount: totalElements };
};

/**
 * 과정 승인
 */
export const approveCourse = async (courseId: number): Promise<void> => {
    await apiClient.post(`/admin/courses/${courseId}/approve`);
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
        '/admin/reviews/approval-requests',
        { params }
    );

    // 응답 데이터 유효성 검사 + 타입 안전성 강화
    const rawContent = response.data?.content;
    const content = Array.isArray(rawContent) ? rawContent : [];
    if (!Array.isArray(rawContent)) {
        console.warn('[adminService] getReviewApprovalRequests: 예상치 못한 응답 형식', {
            status: response.status,
            keys: Object.keys(response.data || {}),
            contentType: typeof rawContent
        });
    }

    const requests = content.map(mapApiReviewToApprovalRequest);
    const totalElements = typeof response.data?.totalElements === 'number' ? response.data.totalElements : 0;

    return { requests, totalCount: totalElements };
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
    // 응답 데이터 유효성 검사
    if (!Array.isArray(response.data)) {
        console.warn('[adminService] getAdminBanners: 예상치 못한 응답 형식', response.data);
    }
    const banners = Array.isArray(response.data) ? response.data : [];
    return banners.map(banner => ({
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
 * 배너 순서 변경 (단일)
 */
export const updateBannerOrder = async (bannerId: number, newOrder: number): Promise<void> => {
    await apiClient.patch(`/admin/banners/${bannerId}/order`, null, {
        params: { newOrder }
    });
};

/**
 * 두 배너의 순서를 원자적으로 교환
 * 백엔드에서 트랜잭션으로 처리하여 데이터 정합성 보장
 */
export const swapBannerOrder = async (bannerId1: number, bannerId2: number): Promise<void> => {
    await apiClient.post('/admin/banners/swap-order', null, {
        params: { bannerId1, bannerId2 }
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

    // 키워드가 있으면 search 엔드포인트, 없으면 기본 목록
    const endpoint = keyword ? '/admin/accounts/search' : '/admin/accounts';
    const response = await apiClient.get<{ content: ApiUserResponse[]; totalElements: number }>(
        endpoint,
        { params }
    );

    // 응답 데이터 유효성 검사 + 타입 안전성 강화
    const rawContent = response.data?.content;
    const content = Array.isArray(rawContent) ? rawContent : [];
    if (!Array.isArray(rawContent)) {
        console.warn('[adminService] getAdminUsers: 예상치 못한 응답 형식', {
            status: response.status,
            keys: Object.keys(response.data || {}),
            contentType: typeof rawContent
        });
    }

    const users = content.map(mapApiUserToAdminUser);
    const totalElements = typeof response.data?.totalElements === 'number' ? response.data.totalElements : 0;

    return { users, totalCount: totalElements };
};

/**
 * 회원 상세 정보 조회
 */
export const getAdminUserDetail = async (userId: number): Promise<AdminUser> => {
    const response = await apiClient.get<ApiUserResponse>(`/admin/accounts/${userId}`);
    return mapApiUserToAdminUser(response.data);
};

/**
 * 회원 정보 수정 요청 타입
 */
export interface UserUpdateData {
    userName: string;
    phoneNumber: string;
    affiliation?: string;
    position?: string;
    address?: string;
    accountApproved?: 'PENDING' | 'APPROVED' | 'REJECTED';  // 관리자만 수정 가능
}

/**
 * 회원 정보 수정
 */
export const updateAdminUser = async (userId: number, data: UserUpdateData): Promise<AdminUser> => {
    const response = await apiClient.put<ApiUserResponse>(`/admin/accounts/${userId}`, data);
    return mapApiUserToAdminUser(response.data);
};

/**
 * 회원 삭제 (Soft Delete)
 */
export const deleteAdminUser = async (userId: number): Promise<void> => {
    await apiClient.delete(`/admin/accounts/${userId}`);
};

// Helper: API 응답을 AdminUser로 변환
const mapApiUserToAdminUser = (user: ApiUserResponse): AdminUser => ({
    id: user.id,
    userName: user.userName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    accountType: user.accountType as AdminUser['accountType'],
    registeredDate: user.createdAt,
    lastLogin: '-',  // 백엔드에서 lastLoginAt을 제공하지 않음
    status: user.approvalStatus === 'APPROVED' ? '활성' : (user.deletedAt ? '탈퇴' : '정지'),
    postCount: user.postCount || 0,
    commentCount: user.commentCount || 0,
    address: user.address,
    affiliation: user.affiliation,
    position: user.position,
    profileImage: user.profileImage
});

/**
 * 관리자용 기관 목록 조회 (검색 및 상태 필터링 지원)
 */
export const getAdminAcademies = async (
    status?: 'PENDING' | 'APPROVED' | 'REJECTED',
    keyword?: string,
    page: number = 1,
    size: number = 20
): Promise<{ academies: AdminAcademy[]; totalCount: number }> => {
    try {
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

        // 응답 데이터 유효성 검사 + 타입 안전성 강화
        const rawContent = response.data?.content;
        const content = Array.isArray(rawContent) ? rawContent : [];
        if (!Array.isArray(rawContent)) {
            const responseData = response.data as unknown;
            console.warn('[adminService] getAdminAcademies: 예상치 못한 응답 형식', {
                status: response.status,
                dataType: typeof responseData,
                data: typeof responseData === 'string' ? responseData.substring(0, 200) : responseData
            });
            return { academies: [], totalCount: 0 };
        }

        const academies = content.map(academy => ({
            id: academy.id,
            name: academy.name,
            businessNumber: academy.businessNumber,
            phone: academy.phoneNumber || '-',
            phoneNumber: academy.phoneNumber || '',
            website: academy.website || '',
            email: academy.email,
            address: academy.address,
            status: academy.isApproved === 'APPROVED' ? '활성' : (academy.isApproved === 'PENDING' ? '대기' : '정지'),
            registeredDate: academy.createdAt,
            courseCount: academy.courseCount || 0,
            logoUrl: academy.logoUrl,  // 기관 프로필 이미지 URL (작성일: 2025-12-03)
        } as AdminAcademy));

        const totalElements = typeof response.data?.totalElements === 'number' ? response.data.totalElements : 0;

        return { academies, totalCount: totalElements };
    } catch (error) {
        console.error('[adminService] getAdminAcademies 실패:', error);
        return { academies: [], totalCount: 0 };
    }
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
 * 기관 생성 요청 데이터 타입
 */
export interface AcademyCreateData {
    name: string;
    address: string;
    businessNumber: string;
    email: string;
    phoneNumber?: string;
    website?: string;
    files: File[];
}

/**
 * 기관 등록 (관리자)
 */
export const createAcademy = async (data: AcademyCreateData): Promise<AdminAcademy> => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('address', data.address);
    formData.append('businessNumber', data.businessNumber);
    formData.append('email', data.email);
    if (data.phoneNumber) {
        formData.append('phoneNumber', data.phoneNumber);
    }
    if (data.website) {
        formData.append('website', data.website);
    }
    
    data.files.forEach((file) => {
        formData.append('files', file);
    });

    const response = await apiClient.post('/api/academies', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    // 응답을 AdminAcademy 형태로 변환
    const academy = response.data;
    return {
        id: academy.id,
        name: academy.name,
        businessNumber: academy.businessNumber,
        address: academy.address,
        phone: academy.phoneNumber || '',
        phoneNumber: academy.phoneNumber || '',
        website: academy.website || '',
        email: academy.email,
        status: academy.approvalStatus === 'APPROVED' ? '활성' : 
                academy.approvalStatus === 'PENDING' ? '대기' : '정지',
        registeredDate: academy.createdAt || new Date().toISOString(),
        courseCount: 0,
    };
};

/**
 * 기관 수정 요청 데이터 타입
 */
export interface AcademyUpdateData {
    name?: string;
    address?: string;
    businessNumber?: string;
    email?: string;
    phoneNumber?: string;
    website?: string;
}

/**
 * 기관 수정 (관리자)
 */
export const updateAcademy = async (id: number, data: AcademyUpdateData): Promise<AdminAcademy> => {
    const response = await apiClient.patch(`/api/academies/${id}`, data);

    // 응답을 AdminAcademy 형태로 변환
    const academy = response.data;
    return {
        id: academy.id,
        name: academy.name,
        businessNumber: academy.businessNumber,
        address: academy.address,
        phone: academy.phoneNumber || '',
        phoneNumber: academy.phoneNumber || '',
        website: academy.website || '',
        email: academy.email,
        status: academy.approvalStatus === 'APPROVED' ? '활성' : 
                academy.approvalStatus === 'PENDING' ? '대기' : '정지',
        registeredDate: academy.createdAt || new Date().toISOString(),
        courseCount: 0,
        logoUrl: academy.logoUrl,
    };
};

/**
 * 기관 프로필 이미지 업로드/수정
 * 작성자: GitHub Copilot
 * 작성일: 2025-12-03
 * 
 * @param academyId 기관 ID
 * @param image 프로필 이미지 파일
 * @returns 업데이트된 기관 정보
 */
export const uploadAcademyProfileImage = async (academyId: number, image: File): Promise<AdminAcademy> => {
    const formData = new FormData();
    formData.append('image', image);

    const response = await apiClient.post(`/api/academies/${academyId}/profile-image`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    const academy = response.data;
    return {
        id: academy.id,
        name: academy.name,
        businessNumber: academy.businessNumber,
        address: academy.address,
        phone: academy.phoneNumber || '',
        email: academy.email,
        status: academy.isApproved === 'APPROVED' ? '활성' : 
                academy.isApproved === 'PENDING' ? '대기' : '정지',
        registeredDate: academy.createdAt || new Date().toISOString(),
        courseCount: academy.courseCount || 0,
        logoUrl: academy.logoUrl,
    };
};

/**
 * 기관 프로필 이미지 삭제
 * 작성자: GitHub Copilot
 * 작성일: 2025-12-03
 * 
 * @param academyId 기관 ID
 * @returns 업데이트된 기관 정보
 */
export const deleteAcademyProfileImage = async (academyId: number): Promise<AdminAcademy> => {
    const response = await apiClient.delete(`/api/academies/${academyId}/profile-image`);

    const academy = response.data;
    return {
        id: academy.id,
        name: academy.name,
        businessNumber: academy.businessNumber,
        address: academy.address,
        phone: academy.phoneNumber || '',
        email: academy.email,
        status: academy.isApproved === 'APPROVED' ? '활성' : 
                academy.isApproved === 'PENDING' ? '대기' : '정지',
        registeredDate: academy.createdAt || new Date().toISOString(),
        courseCount: academy.courseCount || 0,
        logoUrl: academy.logoUrl,
    };
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

    // 응답 데이터 유효성 검사 + 타입 안전성 강화
    const rawContent = response.data?.content;
    const content = Array.isArray(rawContent) ? rawContent : [];
    if (!Array.isArray(rawContent)) {
        console.warn('[adminService] getInstitutionCourses: 예상치 못한 응답 형식', {
            status: response.status,
            keys: Object.keys(response.data || {}),
            contentType: typeof rawContent
        });
    }

    const requests = content.map(mapApiCourseToApprovalRequest);
    const totalElements = typeof response.data?.totalElements === 'number' ? response.data.totalElements : 0;

    return { requests, totalCount: totalElements };
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

    // 응답 데이터 유효성 검사 + 타입 안전성 강화
    const rawContent = response.data?.content;
    const content = Array.isArray(rawContent) ? rawContent : [];
    if (!Array.isArray(rawContent)) {
        console.warn('[adminService] getInstitutionReviews: 예상치 못한 응답 형식', {
            status: response.status,
            keys: Object.keys(response.data || {}),
            contentType: typeof rawContent
        });
    }

    const requests = content.map(mapApiReviewToApprovalRequest);
    const totalElements = typeof response.data?.totalElements === 'number' ? response.data.totalElements : 0;

    return { requests, totalCount: totalElements };
};

/**
 * 커리큘럼 요청 DTO (백엔드 CurriculumRequestDTO와 일치)
 * 작성일: 2025-12-03
 */
export interface CurriculumRequestDTO {
    id?: number;              // 기존 커리큘럼 ID (수정 시 사용)
    chapterNumber: number;    // 챕터 번호
    chapterName: string;      // 챕터 이름
    chapterDetail?: string;   // 챕터 상세 설명
    chapterTime: number;      // 챕터 시간 (시간 단위)
}

/**
 * 과정 등록 요청 DTO (백엔드 CourseRequestDTO와 일치)
 * 수정일: 2025-12-03 - 커리큘럼 필드 추가
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
    capacity?: number;  // 모집 정원
    classDay?: string;
    location?: string;
    isKdt?: boolean;
    isNailbaeum?: boolean;
    isOffline?: boolean;
    requirement?: string;
    curriculums?: CurriculumRequestDTO[];  // 커리큘럼 목록 (2025-12-03 추가)
}

/**
 * 프론트엔드 폼 데이터를 백엔드 DTO로 변환하는 헬퍼 함수
 * 카테고리는 이제 동적으로 로드되므로 직접 사용
 * 수정일: 2025-12-03 - 커리큘럼 변환 추가
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
        capacity?: number;
        classDay?: string;
        isKdt?: boolean;
        isNailbaeum?: boolean;
        isOffline?: boolean;
        location?: string;
        description?: string;
        curriculums?: CurriculumRequestDTO[];  // 커리큘럼 (2025-12-03 추가)
    },
    academyId: number
): CourseRegistrationRequest => {
    // 대상(target)에 따라 categoryType 결정 (중앙화된 유틸리티 함수 사용)
    const categoryType = targetToCategoryType(formData.target);

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
        capacity: formData.capacity,
        classDay: formData.classDay, // 수업 요일 (백엔드 기본값: 평일)
        location: formData.location,
        isKdt: formData.isKdt,
        isNailbaeum: formData.isNailbaeum,
        isOffline: formData.isOffline ?? (formData.format === '오프라인'),
        requirement: formData.description,
        curriculums: formData.curriculums,  // 커리큘럼 추가 (2025-12-03)
    };
};

/**
 * 과정 등록 요청 (기관용 - PENDING 상태로 생성)
 */
export const requestCourseRegistration = async (courseData: CourseRegistrationRequest): Promise<CourseApprovalRequest> => {
    const response = await apiClient.post<ApiCourseResponse>('/api/courses/request', courseData);

    // 응답 데이터를 프론트엔드 타입으로 변환
    const course = response.data;
    return mapApiCourseToApprovalRequest(course);
};

/**
 * 과정 직접 등록 (관리자용 - 즉시 APPROVED 상태로 생성)
 */
export const createCourseByAdmin = async (courseData: CourseRegistrationRequest): Promise<CourseApprovalRequest> => {
    const response = await apiClient.post<ApiCourseResponse>('/api/courses', courseData);

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
    const response = await apiClient.put<ApiCourseResponse>(`/api/courses/${courseId}`, courseData);

    const course = response.data;
    return mapApiCourseToApprovalRequest(course);
};

// 과정 이미지 타입
export type CourseImageType = 'THUMBNAIL' | 'HEADER' | 'CONTENT';

// 과정 이미지 응답 타입
export interface CourseImageUploadResponse {
    imageId: number;
    imageUrl: string;
    imageType: CourseImageType;
    isThumbnail: boolean; // 하위 호환
}

/**
 * 과정 이미지 업로드
 * @param categoryType 카테고리 타입 (EMPLOYEE/JOB_SEEKER)
 * @param courseId 과정 ID
 * @param file 업로드할 이미지 파일
 * @param imageType 이미지 타입 (THUMBNAIL, HEADER, CONTENT) - 기본값: THUMBNAIL
 */
export const uploadCourseImage = async (
    categoryType: CategoryType,
    courseId: number,
    file: File,
    imageType: CourseImageType = 'THUMBNAIL'
): Promise<CourseImageUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<CourseImageUploadResponse>(
        `/api/${categoryType}/courses/${courseId}/images`,
        formData,
        {
            params: { imageType },
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );

    return response.data;
};

/**
 * 과정 이미지 삭제 (Soft Delete)
 * 백엔드에서 isDeleted=true로 마킹되고, 스케줄러가 나중에 S3 파일을 정리합니다.
 * @param categoryType 카테고리 타입 (EMPLOYEE/JOB_SEEKER)
 * @param imageId 삭제할 이미지 ID
 */
export const deleteCourseImage = async (
    categoryType: CategoryType,
    imageId: number
): Promise<void> => {
    await apiClient.delete(`/api/${categoryType}/courses/images/${imageId}`);
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
    target: categoryTypeToTarget(course.categoryType),
    format: course.offline ? '오프라인' : '온라인',
    requestType: '등록',
    requestDate: course.createdAt,
    status: mapStatus(course.approvalStatus),
    rejectionReason: course.rejectionReason,
    recruitStart: course.recruitStart,
    recruitEnd: course.recruitEnd,
    courseStart: course.courseStart,
    courseEnd: course.courseEnd,
    cost: course.cost,
    capacity: course.capacity,
    isKdt: course.kdt,
    isNailbaeum: course.nailbaeum,
    isOffline: course.offline,
    location: course.location,
    description: course.requirement,
    imageUrl: course.imageUrl,
    thumbnailImageId: course.thumbnailImageId,
    headerImageUrl: course.headerImageUrl,
    headerImageId: course.headerImageId,
});

// Helper: 리뷰 응답 매핑
const mapApiReviewToApprovalRequest = (review: ApiReviewResponse): ReviewApprovalRequest => ({
    id: review.reviewId,
    reviewId: review.reviewId,
    courseName: review.courseName,
    academyId: review.academyId,
    writerName: review.writerName,
    writerId: review.writerId,
    rating: review.averageScore,
    comment: review.comment,
    requestType: '등록',
    requestDate: review.createdAt,
    status: mapStatus(review.approvalStatus),
    rejectionReason: review.rejectionReason,
});
