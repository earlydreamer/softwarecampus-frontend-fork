import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Account } from '../types';
import apiClient from '../services/api/client';

interface AuthState {
  user: Account | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null; // 토큰 만료 시간 (timestamp)
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// 관리자 테스트 계정 (개발 환경에서만 사용)
const ADMIN_TEST_ACCOUNT = import.meta.env.DEV ? {
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
} : null;

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        // 관리자 테스트 계정 (개발 환경에서만 작동)
        if (import.meta.env.DEV && ADMIN_TEST_ACCOUNT && email === ADMIN_TEST_ACCOUNT.user.email && password === ADMIN_TEST_ACCOUNT.password) {
          set({
            user: ADMIN_TEST_ACCOUNT.user,
            accessToken: 'admin-test-token',
            refreshToken: 'admin-test-refresh',
            expiresAt: Date.now() + 3600 * 1000, // 1시간 후 만료
            isAuthenticated: true
          });
          return true;
        }

        // 실제 백엔드 API 호출
        try {
          const response = await apiClient.post('/api/auth/login', { email, password });
          const { accessToken, refreshToken, account, expiresIn } = response.data;

          // 만료 시간 계산 (현재 시간 + expiresIn 초)
          const expiresAt = Date.now() + (expiresIn * 1000);

          set({
            user: account,
            accessToken,
            refreshToken,
            expiresAt,
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
          expiresAt: null,
          isAuthenticated: false
        });
      }
    }),
    {
      name: 'auth-storage'
    }
  )
);
