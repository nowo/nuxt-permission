import type { PermissionMenu } from '../types'
import { permissionOptions } from '#nuxt-permission/options'
import { normalizeMenus } from '../core/menus'

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
    return normalizeMenus(list, cb, permissionOptions.routeFields ?? [])
}
