import apiClient from './api/client';
import type { Academy } from '../types';

// ===== 임시: Mock 데이터 re-export (실제 API 연동 전까지) =====
export {
    fetchAcademies,
    fetchAcademyById,
    fetchCoursesByAcademyId,
    fetchAcademyQnAs
} from './mockData';

/**
 * 승인된 기관 목록 조회
 * @param approved 승인 여부 (true: 승인된 기관만, false: 미승인 기관만, null: 전체)
 */
export const getApprovedAcademies = async (approved: boolean = true): Promise<Academy[]> => {
    const response = await apiClient.get<Academy[]>('/academies', {
        params: { approved }
    });
    return response.data;
};

/**
 * 기관 등록 신청 (파일 업로드 포함)
 * @param formData 기관 등록 데이터 (Multipart/form-data)
 */
export const createAcademy = async (formData: FormData): Promise<Academy> => {
    const response = await apiClient.post<Academy>('/academies', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * 기관 상세 조회
 */
export const getAcademyDetails = async (academyId: number): Promise<Academy> => {
    const response = await apiClient.get<Academy>(`/academies/${academyId}`);
    return response.data;
};

