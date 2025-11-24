import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';

// ESM 환경에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  
  // 안전한 포트 파싱
  const portEnv = env.VITE_DEV_PORT;
  const parsedPort = portEnv ? parseInt(portEnv.trim(), 10) : NaN;
  const port = Number.isFinite(parsedPort) ? parsedPort : 5173;
  
  const host = env.VITE_DEV_HOST ?? '127.0.0.1';

  return {
    envPrefix: 'VITE_',
    server: {
      port,
      host,
      strictPort: true
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.')
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // React 코어 라이브러리
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            // TanStack Query
            'react-query': ['@tanstack/react-query'],
            // Tiptap 에디터 (가장 큰 라이브러리)
            'tiptap': [
              '@tiptap/react',
              '@tiptap/starter-kit',
              '@tiptap/extension-placeholder',
              '@tiptap/extension-link',
              '@tiptap/extension-image'
            ],
            // 상태 관리
            'state': ['zustand'],
            // HTTP 클라이언트
            'http': ['axios']
          }
        }
      },
      chunkSizeWarningLimit: 600
    }
  };
});
