import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    // Proxy all /api/* and TTS requests to the FastAPI backend.
    // This means test files served by Vite can call /api/health, /api/login etc.
    // directly without hardcoding the backend URL or hitting CORS.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/google-tts': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/tts': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
