import { Academy, AcademyField } from '../types';
import { mockAcademies } from '../data/mockAcademyData';

export interface AcademyFilters {
  keyword?: string;
  field?: AcademyField;
  isRecruiting?: boolean;
}

/**
 * 기관 목록 조회
 */
export const fetchAcademies = async (filters: AcademyFilters = {}): Promise<Academy[]> => {
  // 실제 API: const response = await axios.get('/api/academies', { params: filters });
  // return response.data;
  
  await new Promise((resolve) => setTimeout(resolve, 300));

  let result = [...mockAcademies];

  // 키워드 필터링
  if (filters.keyword && filters.keyword.trim()) {
    const keyword = filters.keyword.trim().toLowerCase();
    result = result.filter(
      (academy) =>
        academy.name.toLowerCase().includes(keyword) ||
        (academy.description && academy.description.toLowerCase().includes(keyword)) ||
        (academy.tags && academy.tags.some((tag) => tag.toLowerCase().includes(keyword)))
    );
  }

  // 교육 분야 필터링
  if (filters.field && filters.field !== '전체') {
    result = result.filter((academy) => 
      academy.fields && academy.fields.includes(filters.field as AcademyField)
    );
  }

  // 모집중 필터링
  if (filters.isRecruiting !== undefined) {
    result = result.filter((academy) => academy.isRecruiting === filters.isRecruiting);
  }

  return result;
};

/**
 * 기관 상세 정보 조회
 */
export const fetchAcademyById = async (id: number): Promise<Academy | null> => {
  // 실제 API: const response = await axios.get(`/api/academies/${id}`);
  // return response.data;
  
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  const academy = mockAcademies.find((a) => a.id === id);
  return academy || null;
};
