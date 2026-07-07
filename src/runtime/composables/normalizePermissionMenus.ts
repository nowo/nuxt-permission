import type { PermissionMenu } from '../types'
import { permissionOptions } from '#nuxt-permission/options'
import { isExternalPath } from '../utils/path'

// Valid vue-router RouteRecordRaw "route-level" fields; everything else goes to meta
const BASE_ROUTE_FIELDS = ['path', 'name', 'redirect', 'alias', 'children', 'meta', 'props', 'beforeEnter', 'sensitive', 'strict']

function getRouteFields() {
    return new Set([...BASE_ROUTE_FIELDS, ...(permissionOptions.routeFields ?? [])])
}

// A node is a button only when explicitly marked `_btn: true` — a library-reserved input marker
// the caller sets in `cb` (e.g. `v => ({ ...v, _btn: `${v.type}` === '2' })`). The backend's own
// `type` field is left untouched as plain data.
const isButton = (item: any) => item?._btn === true

/**
 * Transform the raw backend menu tree into a route-shaped tree:
 * - a node marked `_btn: true` (in `cb`) → folded into the parent's `meta._permission`; otherwise a menu node
 * - non route-level fields + flattened backend `meta` → into `meta`
 * - a node with menu children is treated as a group and `redirect`s to its first child
 *
 * @param list The raw backend menu array.
 * @param cb Optional per-node normalizer/filter. Set `_btn: true` to mark a button. Return the
 *   (possibly reshaped) node, or a falsy value to drop that node and its whole subtree. Omit it
 *   when the backend data is already in shape and there are no button permissions to fold.
 */
export function normalizePermissionMenus<T = any>(
    list: T[],
    cb: (item: T) => any | undefined | null | false = item => item,
): PermissionMenu[] {
    const routeFields = getRouteFields()

    // Apply cb + split one level of raw nodes into { menu nodes, folded button permissions }
    const split = (rawItems: any[] | undefined) => {
        const menus: any[] = []
        // Collected as `any` internally (values come from the `any` cb result); public meta._permission is PermissionButton
        const permission: Record<string, any> = {}
        for (const raw of rawItems ?? []) {
            const mapped = cb(raw as T)
            if (!mapped) {
                continue
            }
            if (isButton(mapped)) {
                if (mapped.permission != null) {
                    // Strip the reserved `_btn` marker before storing the button node
                    const { _btn, ...button } = mapped
                    permission[mapped.permission] = button
                }
            } else {
                menus.push(mapped)
            }
        }
        return { menus, permission }
    }

    const build = (mapped: any): PermissionMenu => {
        const { menus: childMenus, permission } = split(mapped.children)
        const node: PermissionMenu = { children: [], meta: {} }

        for (const [key, value] of Object.entries(mapped)) {
            // Skip `children` (handled above) and the reserved `_btn` marker (must not leak into meta)
            if (key === 'children' || key === '_btn') {
                continue
            }
            if (key === 'meta') {
                // Flatten a backend meta object; ignore a non-object meta (null/primitive)
                // instead of letting it fall through and become meta.meta
                if (value && typeof value === 'object' && !Array.isArray(value)) {
                    Object.assign(node.meta, value)
                }
            } else if (routeFields.has(key)) {
                (node as any)[key] = value
            } else {
                node.meta[key] = value
            }
        }

        if (Object.keys(permission).length) {
            node.meta._permission = permission
        }
        // Flag external links so the sidebar can render them as <a> (they are not registered as routes)
        if (isExternalPath(node.path)) {
            node.meta._external = true
        }
        node.children = childMenus.map(build)
        // The redirect vs navigate decision for group nodes is made at registration (treeToRoutes),
        // where the manifest is available to know whether the group has its own page.
        return node
    }

    return split(list).menus.map(build)
}
