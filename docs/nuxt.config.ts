export default defineNuxtConfig({
    extends: ['docus'],
    modules: ['@nuxtjs/i18n'],
    site: {
        name: 'nuxt-permission',
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
    // Deploying under a subpath (nowo.github.io/nuxt-permission): uncomment when wiring the GitHub
    // Pages workflow, then run `nuxt generate`.
    // app: { baseURL: '/nuxt-permission/' },
    // nitro: { preset: 'github-pages' },
})
