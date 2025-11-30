import apiClient from './api/client';
import type { Academy, AcademyQA, Course, ApprovalStatus } from '../types/index';
import type { ApiAcademyResponse, ApiAcademyQAResponse } from './api/types';
import { fetchCourses } from './courseService';

// Helper to map DTO to Academy
const mapDtoToAcademy = (dto: ApiAcademyResponse): Academy => {
    return {
        id: dto.id,
        name: dto.name,
        address: dto.address,
        businessNumber: dto.businessNumber,
        email: dto.email,
        approvalStatus: dto.approvalStatus as ApprovalStatus,
        approvedAt: dto.approvedAt,

        // UI fields (Default or mapped)
        description: '', // 백엔드 없음
        phone: '', // 백엔드 없음
        website: '', // 백엔드 없음
        logoUrl: dto.attachedFiles.length > 0 ? dto.attachedFiles[0].downloadUrl : undefined,
        courseCount: 0, // 별도 조회 필요
        rating: 0,
        reviewCount: 0,
    };
};

export interface AcademyFilterParams {
    keyword?: string;
}

export const fetchAcademies = async (filters?: AcademyFilterParams): Promise<Academy[]> => {
    try {
        const params = filters?.keyword ? { keyword: filters.keyword } : undefined;
        const path = filters?.keyword ? '/academies/search' : '/academies';

        const response = await apiClient.get<ApiAcademyResponse[]>(path, { params });
        return response.data.map(mapDtoToAcademy);
    } catch (error) {
        console.error('Failed to fetch academies:', error);
        return [];
    }
};

export const fetchAcademyById = async (academyId: number): Promise<Academy | null> => {
    try {
        const response = await apiClient.get<ApiAcademyResponse>(`/academies/${academyId}`);
        return mapDtoToAcademy(response.data);
    } catch (error) {
        console.error(`Failed to fetch academy ${academyId}:`, error);
        return null;
    }
};

export const fetchAcademyQnAs = async (
    academyId: number,
    page: number = 1,
    limit: number = 5,
    keyword?: string
): Promise<{ qnas: AcademyQA[], totalCount: number }> => {
    try {
        // 백엔드 API 호출 (Pageable 파라미터 전달)
        // Spring Data Pageable은 0-indexed page를 사용하므로 page - 1
        const params: any = {
            page: page - 1,
            size: limit,
        };
        if (keyword) {
            params.keyword = keyword;
        }

        // 응답 타입: Page<QAResponse> 구조 (content, totalElements 등 포함)
        // ApiAcademyQAResponse[] 가 아니라 Page 구조임.
        // 하지만 apiClient.get 제네릭을 any로 하거나, Page 타입을 정의해서 사용해야 함.
        // 여기서는 편의상 any로 처리하고 내부 구조 접근
        const response = await apiClient.get<any>(`/academies/${academyId}/qna`, { params });

        const content = response.data.content as ApiAcademyQAResponse[];
        const totalElements = response.data.totalElements;

        const qnas = content.map(qna => ({
            id: qna.id,
            academyId: qna.academyId,
            accountId: qna.accountId,
            writerName: qna.writerName,
            title: qna.title,
            questionText: qna.questionText,
            answerText: qna.answerText,
            isAnswered: qna.isAnswered,
            answeredById: qna.answeredById,
            answeredByName: qna.answeredByName,
            createdAt: qna.createdAt,
            updatedAt: qna.updatedAt,
            viewCount: 0,
        }));

        return { qnas, totalCount: totalElements };
    } catch (error) {
        console.error(`Failed to fetch QnAs for academy ${academyId}:`, error);
        return { qnas: [], totalCount: 0 };
    }
};

// 기관별 과정 목록 조회
// 현재 백엔드에 기관 ID로 과정을 조회하는 전용 API가 없으므로,
// 전체 과정을 조회한 후 필터링하거나, 백엔드에 API 추가가 필요함.
// 임시로 전체 과정을 가져와서 필터링하는 방식 사용 (비효율적일 수 있음)
export const fetchCoursesByAcademyId = async (academyId: number): Promise<Course[]> => {
    try {
        // 재직자, 구직자 과정 모두 조회
        const courses = await fetchCourses({ categoryType: 'ALL' });
        return courses.filter(course => course.academy.id === academyId);
    } catch (error) {
        console.error(`Failed to fetch courses for academy ${academyId}:`, error);
        return [];
    }
};
