import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './index.html',
    './App.tsx',
    './components/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
    './data/**/*.{ts,tsx}',
    './store/**/*.{ts,tsx}',
    './services/**/*.{ts,tsx}',
    './types.ts'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0052cc',
          dark: '#3399ff',
          light: '#e6f0ff'
        },
        secondary: '#ffc107',
        accent: '#4caf50'
      },
      animation: {
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }
    }
  },
  plugins: []
};

export default config;
