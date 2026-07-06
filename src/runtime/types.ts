import type { _RouteRecordBase, RouteMeta, RouteRecordRaw } from 'vue-router'

/**
 * Permission-key map: extended by users via declaration merging.
 * @example
 * declare module 'nuxt-permission' {
 *   interface PermissionMap { keys: 'menu-add' | 'menu-edit' }
 * }
 */
export interface PermissionMap {}

/** Permission key: the union of PermissionMap's field values if extended, otherwise falls back to string */
export type PermissionKey = keyof PermissionMap extends never
    ? string
    : PermissionMap[keyof PermissionMap]

/**
 * The value of meta._permission — the folded button node.
 * The library stores it as an opaque object; users type its fields via declaration merging
 * based on their backend shape:
 * @example
 * declare module 'nuxt-permission' {
 *   interface PermissionButton { id: number, name: string, permission: string }
 * }
 */
export interface PermissionButton {
    [key: string]: any
}

/**
 * A menu node produced by normalizeMenus. Route-level fields are reused directly from
 * vue-router's `_RouteRecordBase` (path/name/redirect/alias/props/sensitive… all made optional);
 * only `children` (recursive of this type) and `meta` (required, vue-router's `RouteMeta`) are
 * overridden. Declare-merge this interface to add extra custom route-level fields.
 */
export interface PermissionMenu extends Partial<Omit<_RouteRecordBase, 'children' | 'meta'>> {
    children: PermissionMenu[]
    meta: RouteMeta
}

/** Source context: the state writers injected by the library */
export interface PermissionSourceContext {
    setPermissionList: (list: string[]) => void
    setMenusList: (tree: PermissionMenu[]) => void
}

/** Data source: read the auth state, fetch permissions/menus, write state, return the menu tree for the library to register */
export type PermissionSource = (
    ctx: PermissionSourceContext,
) => PermissionMenu[] | Promise<PermissionMenu[]>

/** Component manifest entry (generated from pages at build time) */
export interface RouteManifestEntry {
    name?: string
    meta?: Record<string, unknown>
    component: NonNullable<RouteRecordRaw['component']>
}
