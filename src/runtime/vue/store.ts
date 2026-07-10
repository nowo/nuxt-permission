import type { Router } from 'vue-router'
import type { PermissionKey, PermissionMenu, PermissionSource, RouteManifestEntry } from '../types'
import { ref } from 'vue'
import { normalizeMenus } from '../core/menus'
import { checkPermission } from '../core/permission'
import { createPermissionStore } from '../core/store'

// Module-scoped singletons — the Vue SPA equivalent of Nuxt's `useState` (no SSR hydration to worry
// about). `usePermissionState` and `hasPermission` both read these same refs.
const permissions = ref<PermissionKey[]>([])
const menus = ref<PermissionMenu[]>([])
const routesVersion = ref(0)

let store: ReturnType<typeof createPermissionStore> | null = null
let routeFields: string[] = []

export interface InitStoreConfig {
    router: Router
    source: PermissionSource
    manifest: Record<string, RouteManifestEntry>
    group: 'redirect' | 'navigate'
    routeFields: string[]
}

/** Build the singleton store from createPermission's config. Called once during bootstrap. */
export function initPermissionStore(config: InitStoreConfig) {
    routeFields = config.routeFields
    store = createPermissionStore({
        permissions,
        menus,
        routesVersion,
        getRouter: () => config.router,
        getRoute: () => config.router.currentRoute.value,
        source: config.source,
        manifest: config.manifest,
        group: config.group,
    })
    return store
}

/**
 * Permission / menu state — same shape as the Nuxt composable.
 * Call `createPermission(router, ...)` once before using this.
 */
export function usePermissionState() {
    if (!store) {
        throw new Error('[nuxt-permission] call createPermission(router, ...) before usePermissionState()')
    }
    return store
}

/**
 * Check whether the current user has a permission (usable in templates via `v-if="hasPermission('x')"`).
 * @param perm A single permission or an array of permissions
 * @param isAll For arrays: false (default) means any match is enough, true requires all
 * @remarks An empty array always returns false — an empty requirement grants no access.
 */
export function hasPermission(perm: PermissionKey | PermissionKey[], isAll = false): boolean {
    return checkPermission(permissions.value, perm, isAll)
}

/**
 * Transform the raw backend menu tree into a route-shaped tree (same as the Nuxt version).
 * `routeFields` comes from the `routeFields` option passed to `createPermission`.
 */
export function normalizePermissionMenus<T = any>(
    list: T[],
    cb: (item: T) => any | undefined | null | false = item => item,
): PermissionMenu[] {
    return normalizeMenus(list, cb, routeFields)
}
