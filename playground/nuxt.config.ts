export default defineNuxtConfig({
    modules: ['nuxt-permission'],
    ssr: false,
    devtools: { enabled: true },
    compatibilityDate: 'latest',
    permission: {
        enabled: true,
        // Whitelist: only / and /login stay static; the rest (/dashboard, /menu) are dynamic
        static: ['/', '/login'],
    },
})
