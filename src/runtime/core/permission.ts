import type { PermissionKey } from '../types'

/**
 * Framework-agnostic permission check against a granted list.
 * @param granted The permissions currently held by the user.
 * @param perm A single permission or an array of permissions.
 * @param isAll For arrays: false (default) means any match is enough, true requires all.
 * @remarks An empty array always returns false — an empty requirement grants no access
 *   (rather than letting `every` grant access via vacuous truth).
 */
export function checkPermission(
    granted: PermissionKey[],
    perm: PermissionKey | PermissionKey[],
    isAll = false,
): boolean {
    const list = Array.isArray(perm) ? perm : [perm]
    if (list.length === 0) return false
    return isAll
        ? list.every(p => granted.includes(p))
        : list.some(p => granted.includes(p))
}
