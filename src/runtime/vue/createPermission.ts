import type { Router } from 'vue-router'
import type { PermissionSource, RouteManifestEntry } from '../types'
import type { GlobComponents } from './manifest'
import { globToManifest } from './manifest'
import { initPermissionStore, usePermissionState } from './store'

export interface CreatePermissionOptions {
    /** The data source: reads auth state, fetches permissions/menus, writes state, returns the menu tree. */
    source: PermissionSource
    /** Mode A — `import.meta.glob('../pages/**\/*.vue')`; its keys become the route manifest. */
    components?: GlobComponents
    /** Mode B / precomputed — a manifest (e.g. from `splitByStatic`). Takes precedence over `components`. */
    manifest?: Record<string, RouteManifestEntry>
    /** Folder name for `components` glob keys when it is not `pages` (e.g. `views`). */
    dir?: string
    /** How a group node that also has its own page behaves: redirect to first child (default) or render itself. */
    group?: 'redirect' | 'navigate'
    /** Extra route-level fields to lift out of each menu node (beyond the built-in vue-router ones). */
    routeFields?: string[]
}

/**
 * Bootstrap permissions for a pure Vue 3 + vue-router SPA (the Nuxt module's counterpart).
 * Installs a one-shot navigation guard that runs the source, registers the dynamic routes, then
 * re-resolves the initial navigation — so a deep link resolves once its route is registered.
 * Returns the same store as `usePermissionState()`.
 *
 * @example
 * createPermission(router, {
 *   components: import.meta.glob('../pages/**\/*.vue'),
 *   source: definePermissionSource(async ({ setPermissionList, setMenuList }) => { ... }),
 * })
 */
export function createPermission(router: Router, options: CreatePermissionOptions) {
    const manifest = options.manifest ?? globToManifest(options.components ?? {}, { dir: options.dir })
    const store = initPermissionStore({
        router,
        source: options.source,
        manifest,
        group: options.group ?? 'redirect',
        routeFields: options.routeFields ?? [],
    })

    // One-shot guard: on the first navigation, run the source and register routes before resolving.
    // `ready` is set before the await so the re-resolve below doesn't re-enter this branch.
    let ready = false
    router.beforeEach(async (to) => {
        if (ready) return true
        ready = true
        await store.load()
        // `to.matched` was computed against the pre-load table; if the target wasn't registered yet,
        // re-resolve it now that the dynamic routes exist. Static routes already matched — leave them.
        if (to.matched.length === 0) return { ...to, replace: true }
        return true
    })

    return store
}

export { usePermissionState }
