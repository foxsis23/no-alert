import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://37.27.194.67',
        changeOrigin: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
        headers: { Host: 'no-alert.net' },
      },
    },
  },
})
