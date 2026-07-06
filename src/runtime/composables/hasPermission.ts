import type { PermissionKey } from '../types'
import { useState } from '#imports'

/**
 * Check whether the current user has a permission (auto-imported; usable directly in
 * templates via `v-if="hasPermission('x')"`).
 * @param perm A single permission or an array of permissions
 * @param isAll For arrays: false (default) means any match is enough, true requires all
 * @remarks An empty array always returns false — an empty requirement grants no access.
 */
export function hasPermission(perm: PermissionKey | PermissionKey[], isAll = false): boolean {
    const permissions = useState<PermissionKey[]>('nuxt-permission:permissions', () => [])
    const list = Array.isArray(perm) ? perm : [perm]
    // An empty list carries no permission requirement; treat it as "no access"
    // in both modes rather than letting `every` grant access via vacuous truth.
    if (list.length === 0) return false
    return isAll
        ? list.every(p => permissions.value.includes(p))
        : list.some(p => permissions.value.includes(p))
}
