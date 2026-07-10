import type { RouteRecordRaw } from 'vue-router'
import type { PermissionMenu, RouteManifestEntry } from '../types'
import { canonicalPath, isExternalPath, toPathname } from '../utils/path'

/**
 * Framework-agnostic core of route registration: flatten the menu tree into route records.
 * `group` ('redirect' | 'navigate') controls how a group node with its own page behaves.
 * See the public wrapper for the full doc.
 */
export function treeToRoutes(
    tree: PermissionMenu[],
    manifest: Record<string, RouteManifestEntry>,
    group: 'redirect' | 'navigate' = 'redirect',
): RouteRecordRaw[] {
    const routes: RouteRecordRaw[] = []
    const seen = new Set<string>()

    // Register each canonical path once. A page reachable from several menu entries (easy to do
    // by accident when configuring the backend menu) would otherwise be addRoute'd twice and
    // trigger a vue-router "duplicate record" warning. The menu tree keeps every entry, so all
    // sidebar links still show — only the route table is deduped (first entry wins).
    const pushRoute = (route: RouteRecordRaw) => {
        if (seen.has(route.path)) return
        seen.add(route.path)
        routes.push(route)
    }

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
                        pushRoute(leaf(node, routePath, entry)) // render its own page
                    } else {
                        // Redirect to the first non-external child, using its canonical pathname (query stripped).
                        // No such child (e.g. all children external) → skip: a record without component/redirect is invalid.
                        const target = children.find(c => c.path && !isExternalPath(c.path))?.path
                        if (target) {
                            pushRoute({ ...routeFields, path: routePath, redirect: canonicalPath(toPathname(target)), meta } as RouteRecordRaw)
                        }
                    }
                }
                walk(children)
            } else if (routePath) {
                const entry = manifest[routePath]
                if (entry) {
                    pushRoute(leaf(node, routePath, entry))
                } else {
                    console.warn(`[nuxt-permission] no page component for menu path: ${node.path}`)
                }
            }
        }
    }

    walk(tree)
    return routes
}
