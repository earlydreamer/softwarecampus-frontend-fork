import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 프록시 대상 경로 목록
const proxyRoutes = [
  '/api',
  '/admin',
  '/courses',
  '/reviews',
  '/banners',
  '/academies',
  '/accounts',
  '/community',
  '/EMPLOYEE',
  '/JOB_SEEKER',
];

// 공통 프록시 설정
const baseProxyOptions = {
  target: 'http://localhost:8081',
  changeOrigin: true,
  secure: false,
};

// 프록시 맵 생성 (각 경로에 독립적인 설정 객체 적용)
const proxyConfig = proxyRoutes.reduce<Record<string, typeof baseProxyOptions>>(
  (acc, route) => {
    acc[route] = { ...baseProxyOptions };
    return acc;
  },
  {}
);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: proxyConfig
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['lucide-react', 'framer-motion', 'clsx', 'tailwind-merge'],
          'vendor-editor': [
            '@tiptap/react',
            '@tiptap/starter-kit',
            '@tiptap/extension-color',
            '@tiptap/extension-highlight',
            '@tiptap/extension-image',
            '@tiptap/extension-link',
            '@tiptap/extension-placeholder',
            '@tiptap/extension-task-item',
            '@tiptap/extension-task-list',
            '@tiptap/extension-text-align',
            '@tiptap/extension-text-style',
            '@tiptap/extension-underline'
          ],
          'vendor-utils': ['axios', 'zustand', 'react-hook-form', '@tanstack/react-query']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
