import type { PermissionKey } from '../types'
import { useState } from '#imports'
import { checkPermission } from '../core/permission'

/**
 * Check whether the current user has a permission (auto-imported; usable directly in
 * templates via `v-if="hasPermission('x')"`).
 * @param perm A single permission or an array of permissions
 * @param isAll For arrays: false (default) means any match is enough, true requires all
 * @remarks An empty array always returns false — an empty requirement grants no access.
 */
export function hasPermission(perm: PermissionKey | PermissionKey[], isAll = false): boolean {
    const permissions = useState<PermissionKey[]>('nuxt-permission:permissions', () => [])
    return checkPermission(permissions.value, perm, isAll)
}
