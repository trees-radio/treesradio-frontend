import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        tailwindcss(),
        react({
            // only needed for mobx TODO: remove when mobx is removed and use react-swc instead
            babel: {
                plugins: [
                    [
                        "@babel/plugin-proposal-decorators",
                        {
                            version: "2023-05"
                        }
                    ]
                ]
            },
        }),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
            manifest: {
              name: 'TreesRadio',
              short_name: 'TR',
              description: 'Music for the Broccoli People',
              theme_color: '#00dd00',
              background_color: '#ffffff',
              display: 'standalone',
              icons: [
                {
                  src: '/logo192.png',
                  sizes: '192x192',
                  type: 'image/png'
                },
                {
                  src: '/logo512.png',
                  sizes: '512x512',
                  type: 'image/png'
                }
              ]
            },
            // Add these options to prevent build hanging
            workbox: {
              clientsClaim: true,
              skipWaiting: true,
              maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, 
            }
          })
    ],
    // These should be at the top level, not inside plugins
    publicDir: 'public',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        input: {
          main: 'index.html'
        }
      }
    }
})