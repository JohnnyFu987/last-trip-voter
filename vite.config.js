import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import VueDevTools from 'vite-plugin-vue-devtools'; // 1. 正確引入 VueDevTools 套件
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // 加入 base 設定，對應你 GitHub 儲存庫的名稱
  base: '/last-trip-voter/', 
  plugins: [
    vue(),
    tailwindcss(),
    VueDevTools(), // 2. 啟用 VueDevTools
  ],
});