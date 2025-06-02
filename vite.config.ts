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
                // Enhanced chunk splitting for better caching and smaller bundles
                manualChunks: {
                    // Core React ecosystem
                    react: ['react', 'react-dom'],
                    
                    // State management
                    mobx: ['mobx', 'mobx-react'],
                    
                    // UI Libraries and components
                    ui: [
                        '@headlessui/react',
                        '@heroicons/react',
                        'react-toastify',
                        'emoji-picker-react',
                        'react-slider',
                        'react-visibility-sensor'
                    ],
                    
                    // Media and player related
                    player: ['react-player', 'howler'],
                    
                    // Firebase core
                    'firebase-core': [
                        'firebase/compat/app',
                        'firebase/app'
                    ],
                    
                    // Firebase auth
                    'firebase-auth': [
                        'firebase/compat/auth',
                        'firebase/auth'
                    ],
                    
                    // Firebase database
                    'firebase-database': [
                        'firebase/compat/database',
                        'firebase/compat/storage',
                        'firebase/database'
                    ],
                    
                    // Utility libraries
                    utils: [
                        'lodash',
                        'axios',
                        'uuid',
                        'date-fns',
                        'url-parse',
                        'localforage',
                        'mitt'
                    ],
                    
                    // Date/time libraries (separate from utils due to size)
                    datetime: ['moment'],
                    
                    
                    // Markdown and text processing
                    markdown: [
                        'react-markdown',
                        'marked',
                        'dompurify',
                        'rehype-raw'
                    ],
                    
                    // Styling and CSS
                    styles: ['tailwindcss', 'classnames'],
                    
                    // Legacy/jQuery and DOM manipulation
                    legacy: ['jquery', 'cash-dom'],
                    
                    // Specialized libraries
                    specialized: [
                        'favico.js',
                        'disposable-email',
                        'immer',
                        'rc-progress',
                        'zustand'
                    ]
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