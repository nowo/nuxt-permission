import type { Ref } from 'vue'
import type { RouteLocationNormalizedLoaded, Router } from 'vue-router'
import type { PermissionKey, PermissionMenu, PermissionSource, RouteManifestEntry } from '../types'
import { checkPermission } from './permission'
import { treeToRoutes } from './routes'

/**
 * Everything framework-specific the store needs, injected by each entry (Nuxt / Vue).
 * The reactive refs come from `useState` (Nuxt, SSR-safe) or module-scoped `ref` (Vue SPA);
 * router/route access is deferred to call time so it runs inside the right context.
 */
export interface PermissionStoreAdapter {
    permissions: Ref<PermissionKey[]>
    menus: Ref<PermissionMenu[]>
    routesVersion: Ref<number>
    getRouter: () => Router
    getRoute: () => RouteLocationNormalizedLoaded
    source: PermissionSource
    manifest: Record<string, RouteManifestEntry>
    group: 'redirect' | 'navigate'
}

// Remove-handles for routes added by load(). Module-scoped so load()/clear() called from
// different components share one list. Client-only path — on the Nuxt server, first-paint
// registration goes through router.options, never load()/clear() (which would leak across requests).
let routeRemovers: (() => void)[] = []

const removeDynamicRoutes = () => {
    for (const remove of routeRemovers) remove()
    routeRemovers = []
}

/**
 * Build the permission/menu store from an adapter. The returned object is the public
 * `usePermissionState()` shape; both the Nuxt composable and the Vue factory delegate here.
 */
export function createPermissionStore(adapter: PermissionStoreAdapter) {
    const { permissions, menus, routesVersion, getRouter, getRoute, source, manifest, group } = adapter

    const setPermissionList = (list: string[]) => {
        // Write side stays string[] (backend data); the read ref is PermissionKey[] for completion.
        // Assert here so extending PermissionMap doesn't force callers to cast their fetched list.
        permissions.value = (list ?? []) as PermissionKey[]
    }
    const setMenuList = (tree: PermissionMenu[]) => {
        menus.value = tree ?? []
    }

    /**
     * Re-run the source, write state and register routes (call after login / manual refresh).
     * Client-only — see the module-scoped `routeRemovers` note above; do not call during SSR.
     */
    const load = async () => {
        const tree = await source({ setPermissionList, setMenuList })
        const router = getRouter()
        // Drop routes from a previous load() first, so a re-login does not register duplicates
        removeDynamicRoutes()
        // Skip paths already in the table (a whitelisted static page, or a dynamic route the
        // SSR first paint already registered via router.options — those are not in routeRemovers,
        // so without this check a later load() would addRoute them again as duplicate records)
        const existing = new Set(router.getRoutes().map(r => r.path))
        for (const route of treeToRoutes(tree ?? [], manifest, group)) {
            if (existing.has(route.path)) continue
            routeRemovers.push(router.addRoute(route))
            existing.add(route.path)
        }
        routesVersion.value++ // notify computed that read router.getRoutes()
        // If the deep-linked first page is registered after the initial resolve, force a re-resolve
        const route = getRoute()
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

    const hasPermission = (perm: PermissionKey | PermissionKey[], isAll = false) =>
        checkPermission(permissions.value, perm, isAll)

    return { permissions, menus, routesVersion, hasPermission, setPermissionList, setMenuList, load, clear }
}
