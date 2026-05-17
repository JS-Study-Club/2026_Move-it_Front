import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 프론트엔드에서 /api-deezer로 요청을 보내면 Vite가 대신 Deezer 서버로 전달합니다.
      '/api-deezer': {
        target: 'https://api.deezer.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-deezer/, ''),
      },
    },
  },
})