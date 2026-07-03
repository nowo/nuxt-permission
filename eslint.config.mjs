// @ts-check
import defineConfig from '@wzo/eslint-config'

// 不叠加 @nuxt/eslint-config 的 createConfigForNuxt——两者都打包 import/unicorn/jsdoc 插件会冲突。
export default defineConfig({
    vue: true,
    ignores: ['log'],
}, {
    // Nuxt 文件路由页允许单词组件名（index / secret / dashboard 等）
    files: ['playground/**', 'test/**'],
    rules: {
        'vue/multi-word-component-names': 'off',
    },
})
