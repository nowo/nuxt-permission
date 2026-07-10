import type { RouteRecordRaw } from 'vue-router'
import type { RouteManifestEntry } from '../types'
import { canonicalPath, joinRoutePath, toPathname } from '../utils/path'

const RE_BACKSLASH = /\\/g
const RE_REL_PREFIX = /^(?:\.\.?\/)+/
const RE_VUE_EXT = /\.vue$/
const RE_INDEX = /(^|\/)index$/
const RE_DUP_SLASH = /\/{2,}/g
const RE_TRAILING_SLASH = /(.)\/$/

/** A lazy component loader as produced by Vite's `import.meta.glob('...*.vue')`. */
export type GlobComponents = Record<string, () => Promise<unknown>>

/** Turn a glob file key into a canonical route path: `../pages/detail/[id].vue` → `/detail/:id`. */
function fileKeyToPath(file: string, dir: string): string {
    let p = file.replace(RE_BACKSLASH, '/')
    const marker = `/${dir}/`
    const at = p.lastIndexOf(marker)
    if (at >= 0) p = p.slice(at + marker.length)
    else p = p.replace(RE_REL_PREFIX, '').replace(new RegExp(`^${dir}/`), '')
    p = p.replace(RE_VUE_EXT, '')
    // `index` files map to their directory root (`user/index` → `user/`, `index` → ``)
    p = p.replace(RE_INDEX, '$1')
    p = `/${p}`.replace(RE_DUP_SLASH, '/').replace(RE_TRAILING_SLASH, '$1')
    return canonicalPath(p)
}

/**
 * Mode A — build a route manifest from `import.meta.glob('../pages/**\/*.vue')`.
 * The glob keys are file paths; each becomes a canonical route path mapped to its lazy component.
 * Pass `{ dir }` when your pages live in a folder not named `pages` (e.g. `views`).
 */
export function globToManifest(
    glob: GlobComponents,
    options: { dir?: string } = {},
): Record<string, RouteManifestEntry> {
    const { dir = 'pages' } = options
    const manifest: Record<string, RouteManifestEntry> = {}
    for (const [file, loader] of Object.entries(glob)) {
        manifest[fileKeyToPath(file, dir)] = { component: loader as RouteManifestEntry['component'] }
    }
    return manifest
}

/**
 * Mode B — split unplugin-vue-router's `auto-routes` by a static whitelist.
 * Whitelisted top-level routes stay in `staticRoutes` (pass to `createRouter`); everything else is
 * flattened into a `manifest` (pass to `createPermission`) so it registers only after login.
 */
export function splitByStatic(
    routes: RouteRecordRaw[],
    whitelist: string[],
): { staticRoutes: RouteRecordRaw[], manifest: Record<string, RouteManifestEntry> } {
    const keep = new Set(whitelist)
    const staticRoutes: RouteRecordRaw[] = []
    const manifest: Record<string, RouteManifestEntry> = {}

    const collect = (route: RouteRecordRaw, parentPath: string) => {
        const full = joinRoutePath(parentPath, route.path)
        if (route.component) {
            manifest[canonicalPath(toPathname(full))] = {
                name: typeof route.name === 'string' ? route.name : undefined,
                meta: route.meta,
                component: route.component,
            }
        }
        for (const child of route.children ?? []) collect(child, full)
    }

    for (const route of routes) {
        if (keep.has(route.path)) staticRoutes.push(route)
        else collect(route, '')
    }
    return { staticRoutes, manifest }
}
