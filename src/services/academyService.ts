import apiClient from './api/client';
import type { Academy, AcademyQA, Course } from '../types';
import type { ApiAcademyResponse } from './api/types';
import { fetchCourses } from './courseService';

/**
 * 백엔드 DTO → 프론트엔드 타입 매핑
 * isApproved → approvalStatus 변환 포함
 */
const mapDtoToAcademy = (dto: ApiAcademyResponse): Academy => {
    return {
        id: dto.id,
        name: dto.name,
        address: dto.address,
        businessNumber: dto.businessNumber,
        email: dto.email,
        approvalStatus: dto.isApproved, // 백엔드 필드명 매핑
        approvedAt: dto.approvedAt,
        // UI 표시용 기본값 (백엔드에서 제공하지 않는 필드)
        description: `${dto.name}에서 제공하는 전문 교육 프로그램입니다.`,
        logoUrl: undefined,
        phone: undefined,
        website: undefined,
        establishedDate: dto.createdAt,
        courseCount: 0, // 실제 과정 수는 별도 API로 가져올 수 있음
        rating: 4.5,
        reviewCount: 0,
        isRecruiting: false,
        fields: [],
    };
};

/**
 * 훈련기관 목록 조회
 * @param approved 승인 여부 필터 (기본값: true - 승인된 기관만)
 */
export const fetchAcademies = async (approved: boolean = true): Promise<Academy[]> => {
    try {
        const response = await apiClient.get<ApiAcademyResponse[]>('/api/academies');
        const academies = response.data;

        // 승인 여부로 필터링
        const filtered = approved
            ? academies.filter(a => a.isApproved === 'APPROVED')
            : academies;

        return filtered.map(mapDtoToAcademy);
    } catch (error) {
        console.error('Failed to fetch academies:', error);
        throw error;
    }
};

/**
 * 훈련기관 상세 조회
 */
export const fetchAcademyById = async (academyId: number): Promise<Academy | null> => {
    try {
        const response = await apiClient.get<ApiAcademyResponse>(`/api/academies/${academyId}`);
        return mapDtoToAcademy(response.data);
    } catch (error) {
        console.error(`Failed to fetch academy ${academyId}:`, error);
        return null;
    }
};

/**
 * 특정 기관의 과정 목록 조회
 */
export const fetchCoursesByAcademyId = async (academyId: number): Promise<Course[]> => {
    try {
        // courseService의 fetchCourses를 활용하여 academyId로 필터링
        // 백엔드 API가 academyId 필터를 지원하지 않는 경우, 전체 과정을 가져온 후 클라이언트에서 필터링
        const allCourses = await fetchCourses();
        return allCourses.filter(course => course.academy.id === academyId);
    } catch (error) {
        console.error(`Failed to fetch courses for academy ${academyId}:`, error);
        return [];
    }
};

/**
 * 기관 Q&A 조회
 * 백엔드 API 엔드포인트가 구현되지 않은 경우 빈 배열 반환
 */
export const fetchAcademyQnAs = async (
    academyId: number,
    _page: number = 1,
    _limit: number = 5
): Promise<{ qas: AcademyQA[], totalCount: number }> => {
    try {
        // TODO: 백엔드 Q&A API 엔드포인트 확인 필요
        // 현재는 빈 응답 반환
        console.warn(`Academy Q&A API not yet implemented for academy ${academyId}`);
        return { qas: [], totalCount: 0 };
    } catch (error) {
        console.error(`Failed to fetch Q&As for academy ${academyId}:`, error);
        return { qas: [], totalCount: 0 };
    }
};

/**
 * 승인된 기관 목록 조회 (호환성 유지)
 * @deprecated Use fetchAcademies() instead
 */
export const getApprovedAcademies = fetchAcademies;

/**
 * 기관 등록 신청 (파일 업로드 포함)
 * @param formData 기관 등록 데이터 (Multipart/form-data)
 */
export const createAcademy = async (formData: FormData): Promise<Academy> => {
    const response = await apiClient.post<ApiAcademyResponse>('/api/academies', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return mapDtoToAcademy(response.data);
};

/**
 * 기관 상세 조회 (호환성 유지)
 * @deprecated Use fetchAcademyById() instead
 */
export const getAcademyDetails = fetchAcademyById;

