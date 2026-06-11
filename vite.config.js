import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  // 固定專屬 port：5173 被另一個專案（YOYO 世界 PWA 的 service worker）占用，
  // strictPort 確保不會自動退回去撞到它
  server: { host: true, port: 5180, strictPort: true },
  preview: { port: 5180, strictPort: true },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1200
  }
});
