import type { RouteRecordRaw } from 'vue-router'
import type { PermissionMenu, RouteManifestEntry } from '../types'
import { permissionOptions } from '#nuxt-permission/options'

/**
 * Flatten the menu tree into route records, forwarding every route-level field on the node
 * (path/name/redirect/alias/props…):
 * - group (has menu children):
 *   - if it has its own page AND `group: 'navigate'` → render its own page (children stay flat)
 *   - otherwise → redirect to its first child (children stay flat)
 * - leaf → attach the component from the manifest by path; warn if not found
 */
export function treeToRoutes(
    tree: PermissionMenu[],
    manifest: Record<string, RouteManifestEntry>,
): RouteRecordRaw[] {
    const routes: RouteRecordRaw[] = []
    const group = permissionOptions.group ?? 'redirect'

    const attach = (node: PermissionMenu, entry: RouteManifestEntry): RouteRecordRaw => {
        const { children: _c, meta, ...routeFields } = node
        return {
            ...routeFields,
            name: node.name ?? entry.name,
            component: entry.component,
            meta: { ...entry.meta, ...meta },
        } as RouteRecordRaw
    }

    const walk = (nodes: PermissionMenu[]) => {
        for (const node of nodes) {
            const { children, meta, ...routeFields } = node
            if (children?.length) {
                // Group node
                if (node.path) {
                    const entry = manifest[node.path]
                    if (group === 'navigate' && entry) {
                        routes.push(attach(node, entry)) // render its own page
                    } else {
                        routes.push({ ...routeFields, redirect: children[0]?.path, meta } as RouteRecordRaw) // redirect to first child
                    }
                }
                walk(children)
            } else if (node.path) {
                const entry = manifest[node.path]
                if (entry) {
                    routes.push(attach(node, entry))
                } else {
                    console.warn(`[nuxt-permission] no page component for menu path: ${node.path}`)
                }
            }
        }
    }

    walk(tree)
    return routes
}
