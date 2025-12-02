import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 백엔드 API 프록시 설정
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
      '/admin': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
      '/courses': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
      '/reviews': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
      '/banners': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
      '/academies': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
      '/accounts': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
      '/community': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
      // 카테고리별 과정 API (EMPLOYEE, JOB_SEEKER)
      '/EMPLOYEE': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
      '/JOB_SEEKER': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
    }
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
