import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/tasks": "http://localhost:5000",
      "/boards": "http://localhost:5000",
    },
  },
})
