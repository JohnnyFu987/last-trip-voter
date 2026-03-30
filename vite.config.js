import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import VueDevTools from 'vite-plugin-vue-devtools'; // 1. 正確引入 VueDevTools 套件

export default defineConfig({
  plugins: [
    vue(),
    VueDevTools(), // 2. 啟用 VueDevTools
  ],
});