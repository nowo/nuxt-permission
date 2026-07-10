import type { Router } from 'vue-router'
import type { PermissionSource, RouteManifestEntry } from '../types'
import type { GlobComponents } from './manifest'
import noopSource from '../source.noop'
import { canonicalPath, toPathname } from '../utils/path'
import { globToManifest } from './manifest'
import { initPermissionStore, usePermissionState } from './store'

export interface CreatePermissionOptions {
    /**
     * Master switch (mirrors the Nuxt module). When false, no route is stripped and the source never
     * runs (all routes stay static, no gating), but the store is still created so `usePermissionState`
     * / `hasPermission` stay callable and don't throw. Useful for debugging or per-environment toggling.
     * @default true
     */
    enabled?: boolean
    /** The data source: reads auth state, fetches permissions/menus, writes state, returns the menu tree. */
    source: PermissionSource
    /**
     * Mode B (recommended, mirrors the Nuxt module) — whitelist of public route paths already registered
     * on the router (e.g. from `vue-router/auto-routes`). Every OTHER registered route is pulled off into
     * the manifest and re-registered only after login. Stripped routes must be named (auto-routes are).
     */
    static?: string[]
    /**
     * Mode A — `import.meta.glob('../pages/**\/*.vue')` as the component source, for hand-written routing
     * where the protected pages are NOT registered on the router. Its keys become the route manifest.
     */
    components?: GlobComponents
    /** Precomputed manifest (escape hatch, e.g. from `splitByStatic`). */
    manifest?: Record<string, RouteManifestEntry>
    /** Folder name for `components` glob keys when it is not `pages` (e.g. `views`). */
    dir?: string
    /** How a group node that also has its own page behaves: redirect to first child (default) or render itself. */
    group?: 'redirect' | 'navigate'
    /** Extra route-level fields to lift out of each menu node (beyond the built-in vue-router ones). */
    routeFields?: string[]
}

/**
 * Pull every non-whitelisted route off the router into `into`, so it registers only after login.
 * vue-router can only remove routes by name, so an unnamed non-whitelisted route can't be stripped —
 * warn and leave it public rather than silently dropping the protection.
 */
function stripStaticRoutes(router: Router, whitelist: string[], into: Record<string, RouteManifestEntry>): void {
    const keep = new Set(whitelist)
    for (const record of router.getRoutes()) {
        if (keep.has(record.path)) continue
        const component = record.components?.default
        if (!component) continue // redirect/layout-only records have nothing to register
        if (record.name == null) {
            console.warn(`[nuxt-permission] route "${record.path}" has no name and cannot be stripped; it stays public. Add a name or use splitByStatic().`)
            continue
        }
        into[canonicalPath(toPathname(record.path))] = {
            name: typeof record.name === 'string' ? record.name : undefined,
            meta: record.meta,
            component,
        }
        router.removeRoute(record.name)
    }
}

/**
 * Bootstrap permissions for a pure Vue 3 + vue-router SPA (the Nuxt module's counterpart).
 * Installs a one-shot navigation guard that runs the source, registers the dynamic routes, then
 * re-resolves the initial navigation — so a deep link resolves once its route is registered.
 * Returns the same store as `usePermissionState()`.
 *
 * @example
 * // Mode B — file routing (unplugin-vue-router); the library strips non-whitelisted routes for you.
 * import { routes } from 'vue-router/auto-routes'
 * const router = createRouter({ history: createWebHistory(), routes })
 * createPermission(router, {
 *   static: ['/', '/login'],
 *   source: definePermissionSource(async ({ setPermissionList, setMenuList }) => { ... }),
 * })
 *
 * @example
 * // Mode A — hand-written routing; the glob is the component source for protected pages.
 * createPermission(router, {
 *   components: import.meta.glob('../pages/**\/*.vue'),
 *   source: definePermissionSource(async ({ setPermissionList, setMenuList }) => { ... }),
 * })
 */
export function createPermission(router: Router, options: CreatePermissionOptions) {
    const enabled = options.enabled ?? true
    const manifest: Record<string, RouteManifestEntry> = {
        ...(options.manifest ?? globToManifest(options.components ?? {}, { dir: options.dir })),
    }
    // Mode B: harvest the protected routes off the router (auto-routes registers them all upfront)
    if (enabled && options.static) stripStaticRoutes(router, options.static, manifest)

    const store = initPermissionStore({
        router,
        // enabled=false → all routes stay static and the source never runs (mirrors the Nuxt module)
        source: enabled ? options.source : noopSource,
        manifest,
        group: options.group ?? 'redirect',
        routeFields: options.routeFields ?? [],
    })

    // enabled=false: skip the guard entirely; the store is still returned so the composables stay safe
    if (!enabled) return store

    // One-shot guard: on the first navigation, run the source and register routes before resolving.
    // `ready` is set before the await so the re-resolve below doesn't re-enter this branch.
    let ready = false
    router.beforeEach(async (to) => {
        if (ready) return true
        ready = true
        const before = router.getRoutes().length
        await store.load()
        // `to.matched` was computed against the pre-load table; if the target wasn't registered yet
        // but load() just added routes, re-resolve so the freshly-registered one matches. Skip the
        // re-resolve when nothing was added (e.g. logged-out source returns []) — re-resolving a path
        // that stays unregistered is futile and makes vue-router log an extra "No match" warning.
        if (to.matched.length === 0 && router.getRoutes().length > before) {
            return { ...to, replace: true }
        }
        return true
    })

    return store
}

export { usePermissionState }
