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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        // 백엔드 API를 통한 로그인
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
