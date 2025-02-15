/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_TITLE: string
    readonly VITE_FIREBASE_URL: string
    readonly VITE_FIREBASE_KEY: string
    readonly VITE_FIREBASE_AUTH: string
    readonly VITE_FIREBASE_BUCKET: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}