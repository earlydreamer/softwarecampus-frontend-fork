import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AccountType } from '../types';

interface User {
  id: string;
  accountType: AccountType;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (id: string, password: string) => boolean;
  logout: () => void;
}

// 임시 계정 데이터
const TEMP_ACCOUNTS = {
  admin: { id: 'admin', password: 'test', accountType: 'ADMIN' as const },
  user: { id: 'user', password: 'test', accountType: 'USER' as const },
  academy: { id: 'academy', password: 'user', accountType: 'ACADEMY' as const }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: (id: string, password: string) => {
        const account = TEMP_ACCOUNTS[id as keyof typeof TEMP_ACCOUNTS];
        
        if (account && account.password === password) {
          set({
            user: { id: account.id, accountType: account.accountType },
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
