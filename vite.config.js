import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import VueDevTools from 'vite-plugin-vue-devtools';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ command }) => {
  return {
    // 判斷是否為生產環境，若是則使用 GitHub 儲存庫名稱，否則使用根路徑
    base: command === 'build' ? '/last-trip-voter/' : '/',
    plugins: [
      vue(),
      tailwindcss(),
      VueDevTools(),
    ],
  };
});