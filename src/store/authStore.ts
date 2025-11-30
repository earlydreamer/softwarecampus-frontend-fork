import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Account } from '../types';
import apiClient from '../services/api/client';

interface AuthState {
  user: Account | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// 관리자 테스트 계정 (백엔드 연동 전 테스트용)
const ADMIN_TEST_ACCOUNT = {
  user: {
    id: 1,
    email: 'admin@test.com',
    userName: '관리자',
    phoneNumber: '010-1234-5678',
    accountType: 'ADMIN' as const,
    approvalStatus: 'APPROVED' as const,
    address: '서울시 강남구',
    affiliation: '소프트웨어캠퍼스',
    position: '시스템 관리자',
    academyId: null
  },
  password: 'test'
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        // 관리자 테스트 계정은 하드코딩 유지
        if (email === 'admin@test.com' && password === 'test') {
          set({
            user: ADMIN_TEST_ACCOUNT.user,
            accessToken: 'admin-test-token',
            refreshToken: 'admin-test-refresh',
            isAuthenticated: true
          });
          return true;
        }

        // 실제 백엔드 API 호출
        try {
          const response = await apiClient.post('/api/auth/login', { email, password });
          const { accessToken, refreshToken, account } = response.data;
          
          set({
            user: account,
            accessToken,
            refreshToken,
            isAuthenticated: true
          });
          return true;
        } catch (error) {
          console.error('로그인 실패:', error);
          return false;
        }
      },
      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false
        });
      }
    }),
    {
      name: 'auth-storage'
    }
  )
);
