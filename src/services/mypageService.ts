import apiClient from './api/client';
import type { Account } from '../types';

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

// 비밀번호 변경 (로그인 상태)
export const updatePassword = async (newPassword: string): Promise<void> => {
    await apiClient.patch('/api/mypage/password', { newPassword });
};

// 파일 업로드
export const uploadFile = async (file: File, folder: string = 'profile', fileType: string = 'PROFILE'): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    formData.append('fileType', fileType);

    const response = await apiClient.post<{ data: string }>('/api/files/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data.data; // FileUploadResponse.success(url) returns { status: "success", data: url }
};
