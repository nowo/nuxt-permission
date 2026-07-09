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

    it('a group whose children are all external links registers no route (404, no crash)', async () => {
        const res = await fetch('/links', { headers: { cookie: 'auth=1' } })
        expect(res.status).toBe(404)
    })

    it('a page shared by two menu entries still resolves (deduped, no duplicate route)', async () => {
        const html = await $fetch('/admin/secret', { headers: { cookie: 'auth=1' } })
        expect(html).toContain('admin-secret')
    })

    it('two entries to the same pathname with different queries both hit the one route', async () => {
        const first = await $fetch('/report?range=7d', { headers: { cookie: 'auth=1' } })
        const second = await $fetch('/report?range=all', { headers: { cookie: 'auth=1' } })
        expect(first).toContain('report-page')
        expect(second).toContain('report-page')
    })

    it('a whitelisted child survives its non-whitelisted parent being stripped (renders unauthenticated)', async () => {
        const html = await $fetch('/protected/open')
        expect(html).toContain('protected-open')
    })

    it('the non-whitelisted parent of a whitelisted child is still unreachable (404)', async () => {
        const res = await fetch('/protected')
        expect(res.status).toBe(404)
    })

    it('folds _btn-marked children into the parent meta._permission (v1.2 reserved key)', async () => {
        const html = await $fetch('/menu', { headers: { cookie: 'auth=1' } })
        expect(html).toContain('perm-keys:menu-add,menu-edit')
        // the legacy `permission` meta key is no longer written (breaking rename)
        expect(html).toContain('legacy-permission:absent')
    })

    it('strips the reserved _btn marker from the stored button node', async () => {
        const html = await $fetch('/menu', { headers: { cookie: 'auth=1' } })
        expect(html).toContain('add-fields:id,name,permission,type') // no _btn
        expect(html).not.toContain('_btn')
    })

    it('registers an optional-param page ([[id]] → :id?), matching both /opt and /opt/5', async () => {
        const bare = await $fetch('/opt', { headers: { cookie: 'auth=1' } })
        const withId = await $fetch('/opt/5', { headers: { cookie: 'auth=1' } })
        expect(bare).toContain('opt-page:none')
        expect(withId).toContain('opt-page:5')
    })

    it('a mailto: link is treated as external — the all-external group still registers no route (404)', async () => {
        // /links has only external children (http + mailto); if mailto were not recognized as
        // external it would become a registerable child and the group would redirect instead of 404
        const res = await fetch('/links', { headers: { cookie: 'auth=1' } })
        expect(res.status).toBe(404)
    })
})
