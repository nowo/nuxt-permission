import type { RouteRecordRaw } from 'vue-router'
import { describe, expect, it } from 'vitest'
import { globToManifest, splitByStatic } from '../src/runtime/vue/manifest'

const stub = () => Promise.resolve({})
const Comp = { template: '<div/>' }

describe('globToManifest', () => {
    it('maps glob file keys to canonical route paths', () => {
        const manifest = globToManifest({
            '../pages/index.vue': stub,
            '../pages/menu/index.vue': stub,
            '../pages/report.vue': stub,
            '../pages/detail/[id].vue': stub,
            '../pages/opt/[[id]].vue': stub,
        })
        expect(Object.keys(manifest).sort()).toEqual(
            ['/', '/detail/:id', '/menu', '/opt/:id?', '/report'].sort(),
        )
        expect(manifest['/detail/:id']?.component).toBe(stub)
    })

    it('respects a custom pages folder name', () => {
        const manifest = globToManifest({ './src/views/home.vue': stub }, { dir: 'views' })
        expect(Object.keys(manifest)).toEqual(['/home'])
    })
})

describe('splitByStatic', () => {
    it('keeps whitelisted top-level routes and flattens the rest into a manifest', () => {
        const routes: RouteRecordRaw[] = [
            { path: '/', component: Comp },
            { path: '/login', component: Comp },
            { path: '/dashboard', name: 'dashboard', component: Comp },
            {
                path: '/menu',
                component: Comp,
                children: [{ path: 'sub', component: Comp }],
            },
        ]
        const { staticRoutes, manifest } = splitByStatic(routes, ['/', '/login'])

        expect(staticRoutes.map(r => r.path)).toEqual(['/', '/login'])
        expect(Object.keys(manifest).sort()).toEqual(['/dashboard', '/menu', '/menu/sub'].sort())
        expect(manifest['/dashboard']?.name).toBe('dashboard')
    })
})
