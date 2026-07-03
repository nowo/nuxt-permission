// @ts-check
import defineConfig from '@wzo/eslint-config'

// Do not stack @nuxt/eslint-config's createConfigForNuxt — both bundle the import/unicorn/jsdoc plugins and conflict.
export default defineConfig({
    vue: true,
    ignores: ['log'],
}, {
    // Nuxt file-based route pages may use single-word component names (index / secret / dashboard, etc.)
    files: ['playground/**', 'test/**'],
    rules: {
        'vue/multi-word-component-names': 'off',
    },
}, {
    // Code snippets in docs (e.g. README) are illustrative only — relax formatting/unused-var rules
    files: ['**/*.md/**'],
    rules: {
        'vue/block-tag-newline': 'off',
        'vue/padding-line-between-blocks': 'off',
        'vue/multi-word-component-names': 'off',
        'unused-imports/no-unused-vars': 'off',
        'no-unused-vars': 'off',
        'ts/no-unused-vars': 'off',
    },
})
