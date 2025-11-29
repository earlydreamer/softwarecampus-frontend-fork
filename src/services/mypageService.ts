import apiClient from './api/client';
import type { Account } from '../types';

export interface UpdateProfileData {
    userName?: string;
    phoneNumber?: string;
    address?: string | null;
    affiliation?: string | null;
    position?: string | null;
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

// 비밀번호 변경
export const updatePassword = async (password: string): Promise<void> => {
    await apiClient.put('/api/mypage/password', { password });
};
