import apiClient from './api/client';
import type { SignupFormData } from '../types';

export const sendEmailVerification = async (email: string) => {
    const response = await apiClient.post('/api/auth/email/send-verification', { email });
    return response.data;
};

export const verifyEmail = async (email: string, code: string) => {
    const response = await apiClient.post('/api/auth/email/verify', { email, code });
    return response.data;
};

export const sendPasswordResetCode = async (email: string) => {
    const response = await apiClient.post('/api/auth/email/send-reset-code', { email });
    return response.data;
};

export const verifyPasswordResetCode = async (email: string, code: string) => {
    const response = await apiClient.post('/api/auth/email/verify-reset', { email, code });
    return response.data;
};

export const checkEmailAvailability = async (email: string) => {
    const response = await apiClient.get(`/api/auth/check-email?email=${email}`);
    return response.data;
};

export const signup = async (data: SignupFormData) => {
    const response = await apiClient.post('/api/auth/signup', data);
    return response.data;
};

// ==========================================
// 비밀번호 변경 이중 인증 API (로그인 상태)
// ==========================================

/**
 * Step 1: 현재 비밀번호 검증
 * - 세션 탈취 공격 방어를 위한 본인 확인
 */
export const verifyCurrentPassword = async (currentPassword: string): Promise<{
    verified: boolean;
    message: string;
}> => {
    const response = await apiClient.post('/api/auth/verify-password', { currentPassword });
    return response.data;
};

/**
 * Step 2: 비밀번호 변경용 이메일 인증 코드 발송
 * - JWT 토큰의 이메일로 발송
 */
export const sendPasswordChangeCode = async (email: string): Promise<{
    success: boolean;
    message: string;
    expiresIn?: number;
}> => {
    const response = await apiClient.post('/api/auth/email/send-change-code', { email });
    return response.data;
};

/**
 * Step 3: 최종 비밀번호 변경 (인증 코드 + 새 비밀번호)
 */
export const changePassword = async (verificationCode: string, newPassword: string): Promise<void> => {
    await apiClient.patch('/api/mypage/password', { verificationCode, newPassword });
};
