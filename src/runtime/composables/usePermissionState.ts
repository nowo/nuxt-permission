import type { PermissionMenu } from '../types'
import { useRoute, useRouter, useState } from '#imports'
import { routeManifest } from '#nuxt-permission/manifest'
import source from '#nuxt-permission/source'
import { treeToRoutes } from '../utils/treeToRoutes'
import { hasPermission } from './hasPermission'

// Remove-handles for routes added by load(). Module-scoped because load()/clear() run on the
// client (post-login / logout); the SSR first-paint path registers via router.options, not here.
let routeRemovers: (() => void)[] = []

const removeDynamicRoutes = () => {
    for (const remove of routeRemovers) remove()
    routeRemovers = []
}

/**
 * Permission / menu state. Token storage is up to the user; permissions and menus
 * live in memory (fetched from the server by the source on every load).
 */
export function usePermissionState() {
    const permissions = useState<string[]>('nuxt-permission:permissions', () => [])
    const menus = useState<PermissionMenu[]>('nuxt-permission:menus', () => [])
    // Reactive signal bumped after each registration pass. `router.getRoutes()` is not reactive,
    // so depend on this in a computed to re-read it: `computed(() => (void routesVersion.value, router.getRoutes()))`.
    const routesVersion = useState('nuxt-permission:routes-version', () => 0)

    const setPermissionList = (list: string[]) => {
        permissions.value = list ?? []
    }
    const setMenusList = (tree: PermissionMenu[]) => {
        menus.value = tree ?? []
    }

    /** Re-run the source, write state and register routes (call after login / manual refresh) */
    const load = async () => {
        const tree = await source({ setPermissionList, setMenusList })
        const router = useRouter()
        // Drop routes from a previous load() first, so a re-login does not register duplicates
        removeDynamicRoutes()
        for (const route of treeToRoutes(tree ?? [], routeManifest)) {
            routeRemovers.push(router.addRoute(route))
        }
        routesVersion.value++ // notify computed that read router.getRoutes()
        // If the deep-linked first page is registered after the initial resolve, force a re-resolve
        const route = useRoute()
        if (!route.matched.length && route.fullPath !== '/') {
            await router.replace(route.fullPath)
        }
    }

    /** Clear state and unregister the dynamic routes added by load() (for logout) */
    const clear = () => {
        permissions.value = []
        menus.value = []
        removeDynamicRoutes()
        routesVersion.value++
    }

    return { permissions, menus, routesVersion, hasPermission, setPermissionList, setMenusList, load, clear }
}
