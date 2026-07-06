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

    it('a group node redirects to its first child by default (group: redirect)', async () => {
        const html = await $fetch('/section', { headers: { cookie: 'auth=1' } })
        expect(html).toContain('section-a') // redirected to /section/a, not the group's own page
    })

    it('registers a param page whose menu path uses bracket syntax ([id] → :id)', async () => {
        const html = await $fetch('/detail/1', { headers: { cookie: 'auth=1' } })
        expect(html).toContain('detail-1')
    })

    it('registers a nested param page flat (renders even without <NuxtPage> in the parent)', async () => {
        const html = await $fetch('/nest/2', { headers: { cookie: 'auth=1' } })
        expect(html).toContain('nest-detail')
    })

    it('registers the pathname when the menu path carries a query', async () => {
        const html = await $fetch('/report?range=7d', { headers: { cookie: 'auth=1' } })
        expect(html).toContain('report-page')
    })
})
