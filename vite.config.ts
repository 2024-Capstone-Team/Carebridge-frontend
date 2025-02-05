import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8080',
    },
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:8080', // 백엔드 서버 주소
    //     changeOrigin: true, // CORS 문제 해결
    //     rewrite: (path) => path.replace(/^\/api/, '') // /api로 시작하는 경로를 수정
    //   }
    // },
  }
});
