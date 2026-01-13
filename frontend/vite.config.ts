import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // เพิ่มส่วนนี้เข้าไปครับ 👇
  build: {
    sourcemap: false, // ปิดลายแทงโค้ด ไม่ให้คนนอกแกะโค้ดเราง่ายๆ
  }
})