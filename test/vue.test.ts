import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

const Stub = { template: '<div/>' }

// The Vue entry keeps a module-scoped singleton store; reset modules per test for isolation.
async function freshVue() {
    vi.resetModules()
    return import('../src/runtime/vue/index')
}

function makeRouter() {
    return createRouter({
        history: createMemoryHistory(),
        routes: [
            { path: '/', component: Stub },
            { path: '/login', component: Stub },
        ],
    })
}

describe('createPermission (vue)', () => {
    beforeEach(() => {
        vi.resetModules()
    })

    it('runs the source on first navigation and resolves a deep link', async () => {
        const { createPermission, definePermissionSource, normalizePermissionMenus } = await freshVue()
        const router = makeRouter()
        createPermission(router, {
            manifest: { '/dashboard': { component: Stub }, '/menu': { component: Stub } },
            source: definePermissionSource(({ setPermissionList, setMenuList }) => {
                setPermissionList(['menu-add'])
                const tree = normalizePermissionMenus([
                    { path: '/dashboard', name: 'dashboard' },
                    { path: '/menu', name: 'menu' },
                ])
                setMenuList(tree)
                return tree
            }),
        })

        await router.push('/dashboard')
        expect(router.currentRoute.value.path).toBe('/dashboard')
        expect(router.currentRoute.value.matched.length).toBeGreaterThan(0)
    })

    it('exposes granted permissions via hasPermission and populates the store', async () => {
        const { createPermission, definePermissionSource, hasPermission, usePermissionState } = await freshVue()
        const router = makeRouter()
        createPermission(router, {
            manifest: { '/dashboard': { component: Stub } },
            source: definePermissionSource(({ setPermissionList, setMenuList }) => {
                setPermissionList(['menu-add', 'menu-edit'])
                const tree = [{ path: '/dashboard', name: 'dashboard', children: [], meta: {} }]
                setMenuList(tree)
                return tree
            }),
        })

        await router.push('/dashboard')
        expect(hasPermission('menu-add')).toBe(true)
        expect(hasPermission('menu-delete')).toBe(false)
        expect(hasPermission(['menu-add', 'menu-delete'], true)).toBe(false)
        expect(hasPermission([])).toBe(false)

        const { permissions, menus } = usePermissionState()
        expect(permissions.value).toEqual(['menu-add', 'menu-edit'])
        expect(menus.value).toHaveLength(1)
    })

    it('leaves a route unregistered when the source grants nothing (logged out)', async () => {
        const { createPermission, definePermissionSource } = await freshVue()
        const router = makeRouter()
        createPermission(router, {
            manifest: { '/dashboard': { component: Stub } },
            source: definePermissionSource(({ setPermissionList, setMenuList }) => {
                setPermissionList([])
                setMenuList([])
                return []
            }),
        })

        await router.push('/dashboard')
        expect(router.currentRoute.value.matched.length).toBe(0)
    })

    it('clear() unregisters dynamic routes and empties state', async () => {
        const { createPermission, definePermissionSource, usePermissionState } = await freshVue()
        const router = makeRouter()
        createPermission(router, {
            manifest: { '/dashboard': { component: Stub } },
            source: definePermissionSource(({ setPermissionList, setMenuList }) => {
                setPermissionList(['menu-add'])
                const tree = [{ path: '/dashboard', name: 'dashboard', children: [], meta: {} }]
                setMenuList(tree)
                return tree
            }),
        })

        await router.push('/dashboard')
        expect(router.getRoutes().some(r => r.path === '/dashboard')).toBe(true)

        const { clear, permissions } = usePermissionState()
        clear()
        expect(router.getRoutes().some(r => r.path === '/dashboard')).toBe(false)
        expect(permissions.value).toEqual([])
    })

    it('usePermissionState throws before createPermission', async () => {
        const { usePermissionState } = await freshVue()
        expect(() => usePermissionState()).toThrow(/createPermission/)
    })

    it('static: strips non-whitelisted routes off the router and re-registers on login', async () => {
        const { createPermission, definePermissionSource } = await freshVue()
        const router = createRouter({
            history: createMemoryHistory(),
            routes: [
                { path: '/', name: 'home', component: Stub },
                { path: '/login', name: 'login', component: Stub },
                { path: '/dashboard', name: 'dashboard', component: Stub },
                { path: '/menu', name: 'menu', component: Stub },
            ],
        })

        createPermission(router, {
            static: ['/', '/login'],
            source: definePermissionSource(({ setPermissionList, setMenuList }) => {
                setPermissionList(['menu-add'])
                const tree = [{ path: '/dashboard', name: 'dashboard', children: [], meta: {} }]
                setMenuList(tree)
                return tree
            }),
        })

        // protected routes are pulled off immediately; public ones stay
        const paths = router.getRoutes().map(r => r.path)
        expect(paths).toContain('/')
        expect(paths).toContain('/login')
        expect(paths).not.toContain('/dashboard')
        expect(paths).not.toContain('/menu')

        // the granted one comes back after the source runs; the ungranted one does not
        await router.push('/dashboard')
        expect(router.currentRoute.value.path).toBe('/dashboard')
        expect(router.currentRoute.value.matched.length).toBeGreaterThan(0)
        expect(router.hasRoute('menu')).toBe(false)
    })

    it('enabled: false keeps all routes static, never runs the source, stays callable', async () => {
        const { createPermission, definePermissionSource, hasPermission, usePermissionState } = await freshVue()
        const router = createRouter({
            history: createMemoryHistory(),
            routes: [
                { path: '/', name: 'home', component: Stub },
                { path: '/dashboard', name: 'dashboard', component: Stub },
            ],
        })
        const source = vi.fn(() => [])

        createPermission(router, {
            enabled: false,
            static: ['/'],
            source: definePermissionSource(source),
        })

        // nothing stripped — the protected route stays reachable
        await router.push('/dashboard')
        expect(router.currentRoute.value.matched.length).toBeGreaterThan(0)
        // the user source is never invoked; composables stay safe
        expect(source).not.toHaveBeenCalled()
        expect(hasPermission('anything')).toBe(false)
        expect(() => usePermissionState()).not.toThrow()
    })

    it('static: warns and keeps an unnamed non-whitelisted route public', async () => {
        const { createPermission, definePermissionSource } = await freshVue()
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const router = createRouter({
            history: createMemoryHistory(),
            routes: [
                { path: '/', name: 'home', component: Stub },
                { path: '/secret', component: Stub }, // no name → cannot be stripped
            ],
        })

        createPermission(router, {
            static: ['/'],
            source: definePermissionSource(() => []),
        })

        expect(router.getRoutes().map(r => r.path)).toContain('/secret')
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('/secret'))
        warn.mockRestore()
    })
})
