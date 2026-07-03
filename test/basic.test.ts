import { fileURLToPath } from 'node:url'
import { $fetch, fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

describe('nuxt-permission', async () => {
    await setup({
        rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
    })

    it('renders the static index page', async () => {
        const html = await $fetch('/')
        expect(html).toContain('<div>basic</div>')
    })

    it('a non-whitelisted page is unreachable when unauthenticated (404)', async () => {
        const res = await fetch('/admin/secret')
        expect(res.status).toBe(404)
    })

    it('once the source allows it, the dynamic route renders on the first SSR paint', async () => {
        const html = await $fetch('/admin/secret', { headers: { cookie: 'auth=1' } })
        expect(html).toContain('admin-secret')
    })
})
