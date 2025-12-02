import apiClient from './api/client';
import type { Banner } from '../types';

/**
 * 백엔드 배너 응답 타입
 */
interface ApiBannerResponse {
    id: number;
    title: string;
    description?: string; // 배너 부제목/설명
    imageUrl: string;
    linkUrl: string;
    sequence: number;
    isActivated: boolean;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
}

/**
 * 활성화된 배너 목록 조회
 */
export const fetchActiveBanners = async (): Promise<Banner[]> => {
    try {
        const response = await apiClient.get<ApiBannerResponse[]>('/banners');
        
        // 시퀀스 순으로 정렬
        const sortedBanners = response.data.sort((a, b) => a.sequence - b.sequence);
        
        // 프론트엔드 Banner 타입으로 변환
        return sortedBanners.map(apiBanner => ({
            id: apiBanner.id,
            title: apiBanner.title,
            subtitle: apiBanner.description || '', // 백엔드 description → 프론트엔드 subtitle
            imageUrl: apiBanner.imageUrl,
            link: apiBanner.linkUrl,
        }));
    } catch (error) {
        console.error('배너 조회 실패:', error);
        throw error;
    }
};
