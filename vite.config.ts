/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  // GitHub Pages เสิร์ฟใต้ /LnwNetwork/ (build ด้วย --mode pages); start.bat ใช้ '/'
  base: mode === 'pages' ? '/LnwNetwork/' : '/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    css: false,
  },
}))
