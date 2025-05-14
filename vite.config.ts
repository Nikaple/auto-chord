import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  // 根据环境动态设置 base URL
  base: process.env.NODE_ENV === 'production' && process.env.GITHUB_PAGES ? '/auto-chord/' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    host: true,
  }
}) 