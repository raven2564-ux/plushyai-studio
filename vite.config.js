import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      workbox: {
        navigateFallbackDenylist: [/^\/__\//]
      },
      manifest: {
        id: '/',
        name: 'PlushyAi Studio',
        short_name: 'PlushyAi',
        description: 'AI Image, Sticker & Video Generator',
        theme_color: '#151522',
        background_color: '#151522',
        display: 'standalone',
        orientation: 'portrait',
        categories: ['entertainment', 'productivity', 'utilities'],
        screenshots: [
          {
            src: '/bg-image.jpg',
            sizes: '1280x720',
            type: 'image/jpeg',
            form_factor: 'wide'
          }
        ],
        icons: [
          {
            src: '/icon-cyberpunk.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-cyberpunk.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-cyberpunk.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
})
