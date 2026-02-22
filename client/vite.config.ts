import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787', // Adjust the port if your Flask server runs on a different one
        changeOrigin: true,
        secure: false,
      },
      '/workflow': {
        target: 'http://127.0.0.1:8787', // Adjust the port if your Flask server runs on a different one
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
