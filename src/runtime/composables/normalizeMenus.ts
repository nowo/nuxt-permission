import type { PermissionMenu } from '../types'
import { useRuntimeConfig } from '#imports'

// Valid vue-router RouteRecordRaw "route-level" fields; everything else goes to meta
const BASE_ROUTE_FIELDS = ['path', 'name', 'redirect', 'alias', 'children', 'meta', 'props', 'beforeEnter', 'sensitive', 'strict']

function getRouteFields() {
    const extra = useRuntimeConfig().public.nuxtPermission?.routeFields ?? []
    return new Set([...BASE_ROUTE_FIELDS, ...extra])
}

const isButton = (item: any) => `${item?.type}` === 'button'

/**
 * Transform the raw backend menu tree into a route-shaped tree:
 * - `type: 'menu'` → node; `type: 'button'` → folded into the parent's `meta.permission`
 * - non route-level fields + flattened backend `meta` → into `meta`
 * - a node with menu children is treated as a group and `redirect`s to its first child
 *
 * @param list The raw backend menu array.
 * @param cb Optional per-node normalizer/filter. Return the (possibly reshaped) node, or a falsy
 *   value to drop that node and its whole subtree. Omit it when the backend data is already in shape.
 */
export function normalizeMenus<T = any>(
    list: T[],
    cb: (item: T) => any | undefined | null | false = item => item,
): PermissionMenu[] {
    const routeFields = getRouteFields()

    // Apply cb + split one level of raw nodes into { menu nodes, folded button permissions }
    const split = (rawItems: any[] | undefined) => {
        const menus: any[] = []
        // Collected as `any` internally (values come from the `any` cb result); public meta.permission is PermissionButton
        const permission: Record<string, any> = {}
        for (const raw of rawItems ?? []) {
            const mapped = cb(raw as T)
            if (!mapped) {
                continue
            }
            if (isButton(mapped)) {
                if (mapped.permission != null) {
                    permission[mapped.permission] = mapped
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
            if (key === 'children') {
                continue
            }
            if (key === 'meta' && value && typeof value === 'object' && !Array.isArray(value)) {
                Object.assign(node.meta, value) // Flatten backend meta, avoid nested meta.meta
            } else if (routeFields.has(key)) {
                (node as any)[key] = value
            } else {
                node.meta[key] = value
            }
        }

        if (Object.keys(permission).length) {
            node.meta.permission = permission
        }
        node.children = childMenus.map(build)
        if (node.children.length) {
            // Group redirects to its first child
            node.redirect = node.children[0]!.path
        }
        return node
    }

    return split(list).menus.map(build)
}
