import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // 使用相对路径，支持本地文件打开
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 确保资源使用相对路径
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})

