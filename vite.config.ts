import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
      },
      includeAssets: ['icon-192.png', 'icon-512.png', 'favicon.ico'],
      manifest: {
        name: '네버엔딩 홍개팅',
        short_name: '네버엔딩 홍개팅',
        description: '대학생을 위한 자유로운 소셜 앱',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#FF6B6B',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        sw: resolve(__dirname, 'firebase-messaging-sw.js'), // ✅ 이 줄 추가됨
      },
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
