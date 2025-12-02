import apiClient from './api/client';
import type { Account, PageResponse, MyPost, MyComment, MyStats, CourseFavorite } from '../types';

export interface UpdateProfileData {
    userName?: string;
    phoneNumber?: string;
    address?: string | null;
    affiliation?: string | null;
    position?: string | null;
    profileImage?: string | null;
}

export const getProfile = async (): Promise<Account> => {
    const response = await apiClient.get<Account>('/api/mypage/profile');
    return response.data;
};

export const updateProfile = async (data: UpdateProfileData): Promise<Account> => {
    const response = await apiClient.patch<Account>('/api/mypage/profile', data);
    return response.data;
};

export const deleteAccount = async (): Promise<void> => {
    await apiClient.delete('/api/mypage/account');
};

// ===== 마이페이지 활동 내역 API =====

/**
 * 내가 쓴 글 목록 조회
 */
export const getMyPosts = async (page = 0, size = 10): Promise<PageResponse<MyPost>> => {
    const response = await apiClient.get<PageResponse<MyPost>>('/api/mypage/posts', {
        params: { page, size }
    });
    return response.data;
};

/**
 * 내가 쓴 댓글 목록 조회
 */
export const getMyComments = async (page = 0, size = 10): Promise<PageResponse<MyComment>> => {
    const response = await apiClient.get<PageResponse<MyComment>>('/api/mypage/comments', {
        params: { page, size }
    });
    return response.data;
};

/**
 * 활동 통계 조회
 */
export const getMyStats = async (): Promise<MyStats> => {
    const response = await apiClient.get<MyStats>('/api/mypage/stats');
    return response.data;
};

/**
 * 찜한 강좌 목록 조회
 */
export const getFavorites = async (): Promise<CourseFavorite[]> => {
    const response = await apiClient.get<CourseFavorite[]>('/api/courses/favorites');
    return response.data;
};

// 파일 업로드
// FormData 전송 시 Content-Type을 명시적으로 multipart/form-data로 설정
export const uploadFile = async (file: File, folder: string = 'profile', fileType: string = 'PROFILE'): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    formData.append('fileType', fileType);

    const response = await apiClient.post<{ fileUrl: string; message: string }>('/api/files/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data.fileUrl;
};
