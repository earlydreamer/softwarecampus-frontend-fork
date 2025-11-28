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

export const checkEmailAvailability = async (email: string) => {
    const response = await apiClient.get(`/api/auth/check-email?email=${email}`);
    return response.data;
};

export const signup = async (data: SignupFormData) => {
    const response = await apiClient.post('/api/auth/signup', data);
    return response.data;
};
