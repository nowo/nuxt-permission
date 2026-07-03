import type { PermissionKey } from '../types'
import { useState } from '#imports'

/**
 * Check whether the current user has a permission (auto-imported; usable directly in
 * templates via `v-if="hasPermission('x')"`).
 * @param perm A single permission or an array of permissions
 * @param isAll For arrays: false (default) means any match is enough, true requires all
 */
export function hasPermission(perm: PermissionKey | PermissionKey[], isAll = false): boolean {
    const permissions = useState<string[]>('nuxt-permission:permissions', () => [])
    const list = Array.isArray(perm) ? perm : [perm]
    return isAll
        ? list.every(p => permissions.value.includes(p))
        : list.some(p => permissions.value.includes(p))
}
