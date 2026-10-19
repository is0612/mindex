import { existsSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

/**
 * 多入口：旧主页 + 三套设计方案 + 方案索引。
 * 只把磁盘上真实存在的 html 登记为入口，边做边建也不会把构建搞挂。
 */
const pages = ['index', 'home', 'home-editorial', 'home-swiss', 'home-glass']

const input = Object.fromEntries(
  pages
    .filter((name) => existsSync(fileURLToPath(new URL(`./${name}.html`, import.meta.url))))
    .map((name) => [name, fileURLToPath(new URL(`./${name}.html`, import.meta.url))]),
)

export default defineConfig({
  // 用相对路径，dist 放到根目录、子目录（如 GitHub Pages 的 /仓库名/）都能跑
  base: './',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    rollupOptions: { input },
  },
})
