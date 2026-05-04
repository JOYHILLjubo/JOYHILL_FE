import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBaseUrl = env.VITE_API_BASE_URL || 'http://localhost:8080'

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}'],
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true,
        },
        manifest: {
          name: '기쁨의 동산교회 청년부',
          short_name: 'JoyHill',
          description: 'JOYHILL 청년부 앱',
          start_url: '/',
          display: 'standalone',
          background_color: '#ffffff',
          theme_color: '#4285F4',
          orientation: 'portrait',
          icons: [
            {
              src: '/app-icon.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable',
            },
            {
              src: '/app-icon.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },
      }),
    ],
    server: {
      proxy: {
        '/api': {
          target: apiBaseUrl,
          changeOrigin: true,
        },
      },
    },
  }
})
