import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// 임시 계정 데이터 (백엔드 AccountResponse 구조와 완전 일치)
const TEMP_ACCOUNTS: Record<string, { user: User; password: string }> = {
  'admin@test.com': {
    user: {
      id: 1,
      email: 'admin@test.com',
      userName: '관리자',
      phoneNumber: '010-1234-5678',
      accountType: 'ADMIN',
      approvalStatus: 'APPROVED',
      address: '서울시 강남구',
      affiliation: '소프트웨어캠퍼스',
      position: '시스템 관리자',
      academyId: null
    },
    password: 'test'
  },
  'user@test.com': {
    user: {
      id: 2,
      email: 'user@test.com',
      userName: '일반사용자',
      phoneNumber: '010-2345-6789',
      accountType: 'USER',
      approvalStatus: 'APPROVED',
      address: '서울시 서초구',
      affiliation: null,
      position: null,
      academyId: null
    },
    password: 'test'
  },
  'academy@test.com': {
    user: {
      id: 3,
      email: 'academy@test.com',
      userName: '소프트웨어캠퍼스 담당자',
      phoneNumber: '02-1234-5678',
      accountType: 'ACADEMY',
      approvalStatus: 'APPROVED',
      address: '서울시 종로구',
      affiliation: '소프트웨어캠퍼스',
      position: '교육팀장',
      academyId: 1 // 기관 ID 할당
    },
    password: 'user'
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        // 시뮬레이션: 네트워크 지연
        await new Promise(resolve => setTimeout(resolve, 500));

        const account = TEMP_ACCOUNTS[email];

        if (account && account.password === password) {
          set({
            user: account.user,
            isAuthenticated: true
          });
          return true;
        }
        return false;
      },
      logout: () => {
        set({
          user: null,
          isAuthenticated: false
        });
      }
    }),
    {
      name: 'auth-storage'
    }
  )
);
