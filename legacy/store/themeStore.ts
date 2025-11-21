import { create } from 'zustand';

interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') {
    return 'light';
  }
  const stored = window.localStorage.getItem('software-campus-theme');
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: getInitialTheme(),
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'light' ? 'dark' : 'light';
      
      // SSR 환경 체크 및 안전한 localStorage 접근
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem('software-campus-theme', next);
        } catch (err) {
          console.warn('Failed to save theme to localStorage:', err);
        }
      }
      
      return { theme: next };
    }),
  setTheme: (theme) => {
    // SSR 환경 체크 및 안전한 localStorage 접근
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('software-campus-theme', theme);
      } catch (err) {
        console.warn('Failed to save theme to localStorage:', err);
      }
    }
    
    set({ theme });
  }
}));
