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
})
