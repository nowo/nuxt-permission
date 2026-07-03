import type { RouteRecordRaw } from 'vue-router'
import type { PermissionMenu, RouteManifestEntry } from '../types'

/**
 * Flatten the menu tree into route records, forwarding every route-level field on the node
 * (path/name/redirect/alias/props…):
 * - group (has children) → redirect record (no component); children keep registering flat
 * - leaf → attach the component from the manifest by path; warn if not found
 */
export function treeToRoutes(
    tree: PermissionMenu[],
    manifest: Record<string, RouteManifestEntry>,
): RouteRecordRaw[] {
    const routes: RouteRecordRaw[] = []

    const walk = (nodes: PermissionMenu[]) => {
        for (const node of nodes) {
            const { children, meta, ...routeFields } = node
            if (children?.length) {
                // Group: forward route fields (including the redirect set by normalizeMenus), no component
                if (node.path) {
                    routes.push({ ...routeFields, meta } as RouteRecordRaw)
                }
                walk(children)
            } else if (node.path) {
                const entry = manifest[node.path]
                if (entry) {
                    routes.push({
                        ...routeFields,
                        name: node.name ?? entry.name,
                        component: entry.component,
                        meta: { ...entry.meta, ...meta },
                    } as RouteRecordRaw)
                } else {
                    console.warn(`[nuxt-permission] no page component for menu path: ${node.path}`)
                }
            }
        }
    }

    walk(tree)
    return routes
}
