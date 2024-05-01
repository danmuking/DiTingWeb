import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import autoprefixer from 'autoprefixer'
// import path from "path";


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@':'/src/'
    }
  },
  css: {
    postcss: {
      plugins: [
        autoprefixer({}), // 自动添加样式兼容前缀
      ],
    },
  },
})
