import type { RouterConfig } from '@nuxt/schema'
import { routeManifest } from '#nuxt-permission/manifest'
import source from '#nuxt-permission/source'
import { usePermissionState } from './composables/usePermissionState'
import { treeToRoutes } from './utils/treeToRoutes'

// Injected by the module via `pages:routerOptions`. routes() is awaited by Nuxt and runs
// before the initial router.push(initialURL), so the first page (refresh / deep-link) registers
// its dynamic routes here under both SSR and SPA.
export default <RouterConfig>{
    routes: async (scanned) => {
        const { setPermissionList, setMenuList } = usePermissionState()
        const tree = await source({ setPermissionList, setMenuList })
        const dynamic = treeToRoutes(tree ?? [], routeManifest)
        return dynamic.length ? [...scanned, ...dynamic] : scanned
    },
}
