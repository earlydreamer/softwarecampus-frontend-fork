import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: Object.fromEntries(
      ['/api', '/admin', '/courses', '/reviews', '/banners', '/academies', '/accounts', '/community', '/EMPLOYEE', '/JOB_SEEKER']
        .map(path => [path, { target: 'http://localhost:8081', changeOrigin: true, secure: false }])
    )
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
