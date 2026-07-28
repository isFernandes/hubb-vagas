/// <reference types="vitest" />
import path from "path"
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    cssMinify: false,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    pool: 'threads',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/pages/Login.tsx',
        'src/pages/Register.tsx',
        'src/pages/admin/Dashboard.tsx',
        'src/pages/candidate/JobsList.tsx',
        'src/components/ui/button.tsx',
        'src/components/ui/input.tsx',
        'src/components/ui/label.tsx'
      ],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/setupTests.ts', 'src/main.tsx', 'src/vite-env.d.ts'],
    },
  },
})
