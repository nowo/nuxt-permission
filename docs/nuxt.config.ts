export default defineNuxtConfig({
    extends: ['docus'],
    modules: ['@nuxtjs/i18n'],
    site: {
        name: 'nuxt-permission',
    },
    // Docus bundles SEO site modules (og-image / robots). Under a subpath baseURL they crash the
    // static prerender (h3 appendResponseHeader on an undefined response — an h3 v1/v2 version skew).
    // Not essential for these docs, so disable them for a working GitHub Pages build.
    ogImage: { enabled: false },
    robots: { enabled: false },
    // A /sitemap.xml route is still registered (via site-config) and 500s under baseURL; skip it.
    nitro: {
        prerender: {
            ignore: ['/sitemap.xml'],
        },
    },
    i18n: {
        defaultLocale: 'en',
        // English-only for now. The full Chinese translation lives in content/zh/ and is ready to
        // ship — but Docus 5.12.3 mishandles the hyphenated `zh-CN` code (its Chinese chrome strings
        // ship only as zh-CN.json, so UI labels fall back to English and the switcher won't list
        // 简体中文). Once Docus supports it upstream, re-enable Chinese by adding the locale back:
        //   { code: 'zh', name: '简体中文' }
        // The content/zh/ pages will light up at /zh/... with no other changes.
        locales: [{
            code: 'en',
            name: 'English',
        }],
    },
    // GitHub Pages deploy (subpath https://nowo.github.io/nuxt-permission/) is handled by
    // .github/workflows/deploy-docs.yml via env vars — NUXT_APP_BASE_URL=/nuxt-permission/ and
    // NITRO_PRESET=github_pages — so local `pnpm dev:docs` stays at the root path.
})
