import type { RouteRecordRaw } from 'vue-router'
import type { PermissionMenu, RouteManifestEntry } from '../types'
import { permissionOptions } from '#nuxt-permission/options'
import { treeToRoutes as treeToRoutesCore } from '../core/routes'

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
    // `group` is 'redirect' | 'navigate' per ModuleOptions, but TS widens it to string when it
    // infers the type from the JSON-serialized options virtual module — narrow it back here.
    return treeToRoutesCore(tree, manifest, (permissionOptions.group ?? 'redirect') as 'redirect' | 'navigate')
}
