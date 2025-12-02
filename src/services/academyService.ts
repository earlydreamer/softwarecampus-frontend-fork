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
        courseCount: dto.courseCount ?? 0,
        rating: dto.rating ?? 0.0,
        reviewCount: dto.reviewCount ?? 0,
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
 * 페이징 및 검색 지원
 */
export const fetchAcademyQnAs = async (
    academyId: number,
    page: number = 1,
    limit: number = 5,
    keyword?: string
): Promise<{ qas: AcademyQA[], totalCount: number }> => {
    try {
        // 백엔드는 0-based 페이지 인덱스 사용
        const params: { page: number; size: number; keyword?: string } = {
            page: page - 1,
            size: limit,
        };
        if (keyword) {
            params.keyword = keyword;
        }
        
        const response = await apiClient.get<{
            content: Array<{
                id: number;
                title: string;
                questionText: string;
                answerText?: string;
                createdAt: string;
                updatedAt: string;
                academyId: number;
                accountId: number;
                writerName: string;
                answeredById?: number;
                answeredByName?: string;
                isAnswered: boolean;
            }>;
            totalElements: number;
            totalPages: number;
            size: number;
            number: number;
        }>(`/api/academies/${academyId}/qna`, { params });

        const qas: AcademyQA[] = response.data.content.map(qa => ({
            id: qa.id,
            academyId: qa.academyId,
            accountId: qa.accountId,
            writerName: qa.writerName,
            title: qa.title,
            questionText: qa.questionText,
            answerText: qa.answerText,
            isAnswered: qa.isAnswered,
            answeredById: qa.answeredById,
            answeredByName: qa.answeredByName,
            createdAt: qa.createdAt,
            updatedAt: qa.updatedAt,
        }));

        return { qas, totalCount: response.data.totalElements };
    } catch (error) {
        console.error(`Failed to fetch Q&As for academy ${academyId}:`, error);
        return { qas: [], totalCount: 0 };
    }
};

/**
 * 기관 Q&A 질문 등록
 */
export const createAcademyQnA = async (
    academyId: number,
    title: string,
    questionText: string
): Promise<AcademyQA> => {
    const response = await apiClient.post<{
        id: number;
        title: string;
        questionText: string;
        answerText?: string;
        createdAt: string;
        updatedAt: string;
        academyId: number;
        accountId: number;
        writerName: string;
        answeredById?: number;
        answeredByName?: string;
        isAnswered: boolean;
    }>(`/api/academies/${academyId}/qna`, {
        title,
        questionText,
        academyId,
    });

    return {
        id: response.data.id,
        academyId: response.data.academyId,
        accountId: response.data.accountId,
        writerName: response.data.writerName,
        title: response.data.title,
        questionText: response.data.questionText,
        answerText: response.data.answerText,
        isAnswered: response.data.isAnswered,
        answeredById: response.data.answeredById,
        answeredByName: response.data.answeredByName,
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt,
    };
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

