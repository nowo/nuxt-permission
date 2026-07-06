import type { RouteRecordRaw } from 'vue-router'
import type { PermissionMenu, RouteManifestEntry } from '../types'
import { permissionOptions } from '#nuxt-permission/options'
import { canonicalPath, isExternalPath, toPathname } from './path'

/**
 * Flatten the menu tree into route records, forwarding every route-level field on the node.
 * - the registered path is the canonical pathname (query stripped, `[id]`/`:id`/`:id()` unified),
 *   while the node keeps its full path for the sidebar link
 * - external links (`http(s)://`, `//`) are skipped (kept in the menu tree, not registered)
 * - group (has menu children): render its own page when `group: 'navigate'` and it has one,
 *   otherwise redirect to its first child (children always register flat)
 * - leaf → attach the component from the manifest by path; warn if not found
 */
export function treeToRoutes(
    tree: PermissionMenu[],
    manifest: Record<string, RouteManifestEntry>,
): RouteRecordRaw[] {
    const routes: RouteRecordRaw[] = []
    const group = permissionOptions.group ?? 'redirect'

    const leaf = (node: PermissionMenu, routePath: string, entry: RouteManifestEntry): RouteRecordRaw => {
        const { children: _c, meta, ...routeFields } = node
        return {
            ...routeFields,
            path: routePath,
            name: node.name ?? entry.name,
            component: entry.component,
            meta: { ...entry.meta, ...meta },
        } as RouteRecordRaw
    }

    const walk = (nodes: PermissionMenu[]) => {
        for (const node of nodes) {
            const { children, meta, ...routeFields } = node
            // External links are not routes; they stay in the menu tree for the sidebar to render as <a>
            if (isExternalPath(node.path)) continue
            const routePath = node.path ? canonicalPath(toPathname(node.path)) : undefined

            if (children?.length) {
                if (routePath) {
                    const entry = manifest[routePath]
                    if (group === 'navigate' && entry) {
                        routes.push(leaf(node, routePath, entry)) // render its own page
                    } else {
                        // Redirect to the first non-external child, using its canonical pathname (query stripped).
                        // No such child (e.g. all children external) → skip: a record without component/redirect is invalid.
                        const target = children.find(c => c.path && !isExternalPath(c.path))?.path
                        if (target) {
                            routes.push({ ...routeFields, path: routePath, redirect: canonicalPath(toPathname(target)), meta } as RouteRecordRaw)
                        }
                    }
                }
                walk(children)
            } else if (routePath) {
                const entry = manifest[routePath]
                if (entry) {
                    routes.push(leaf(node, routePath, entry))
                } else {
                    console.warn(`[nuxt-permission] no page component for menu path: ${node.path}`)
                }
            }
        }
    }

    walk(tree)
    return routes
}
