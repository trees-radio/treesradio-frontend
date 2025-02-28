// vite.config.ts with fixed tree shaking configuration
import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    plugins: [
        tailwindcss(),
        react({
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
              description: 'Music for the Broccoli People.',
              theme_color: '#85ac37',
              background_color: '#222222',
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
            workbox: {
              clientsClaim: true,
              skipWaiting: true,
              maximumFileSizeToCacheInBytes: 3 * 1024 * 1024
            }
        })
    ],
    publicDir: 'public',
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        // Enhanced build optimization
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,  // Remove console.* calls
                pure_funcs: ['console.log', 'console.debug'] // Treat these functions as pure (removable)
            }
        },
        rollupOptions: {
            input: {
                main: 'index.html'
            },
            output: {
                // Split chunks for better caching
                manualChunks: {
                    // Group React and related packages
                    react: ['react', 'react-dom'],
                    // Put large vendor packages in separate chunks
                    vendor: ['mobx', 'mobx-react-lite', 'tailwindcss'],
                    // You can define more chunks as needed
                }
            },
            // Preserve ESM modules for better tree shaking
            preserveEntrySignatures: 'strict',
        }
    },
    // Remove the problematic esbuild configuration
    // optimizeDeps config is safe to keep
    optimizeDeps: {
        include: [],
        exclude: []
    }
})