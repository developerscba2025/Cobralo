import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'


// https://vite.dev/config/
export default defineConfig({
  base: '/',
  resolve: {
    dedupe: ['react', 'react-dom', 'react-router-dom']
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins: ([
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Cobralo App',
        short_name: 'Cobralo',
        description: 'Gestión de alumnos y pagos',
        theme_color: '#16a34a',
        background_color: '#050805',
        display: 'standalone',
        start_url: '/app/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ] as any),
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['lucide-react', 'framer-motion'],
          'vendor-charts': ['recharts'],
          'vendor-utils': ['xlsx', 'qrcode.react']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
