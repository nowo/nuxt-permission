import type { PermissionMenu } from '../types'
import { useRoute, useRouter, useState } from '#imports'
import { routeManifest } from '#nuxt-permission/manifest'
import source from '#nuxt-permission/source'
import { treeToRoutes } from '../utils/treeToRoutes'
import { hasPermission } from './hasPermission'

/**
 * Permission / menu state. Token storage is up to the user; permissions and menus
 * live in memory (fetched from the server by the source on every load).
 */
export function usePermissionState() {
    const permissions = useState<string[]>('nuxt-permission:permissions', () => [])
    const menus = useState<PermissionMenu[]>('nuxt-permission:menus', () => [])

    const setPermissionList = (list: string[]) => {
        permissions.value = list ?? []
    }
    const setMenusList = (tree: PermissionMenu[]) => {
        menus.value = tree ?? []
    }

    /** Re-run the source, write state and register routes (call after login / manual refresh) */
    const load = async () => {
        const tree = await source({ setPermissionList, setMenusList })
        const router = useRouter()
        for (const route of treeToRoutes(tree ?? [], routeManifest)) {
            router.addRoute(route)
        }
        // If the deep-linked first page is registered after the initial resolve, force a re-resolve
        const route = useRoute()
        if (!route.matched.length && route.fullPath !== '/') {
            await router.replace(route.fullPath)
        }
    }

    /** Clear state (for logout) */
    const clear = () => {
        permissions.value = []
        menus.value = []
    }

    return { permissions, menus, hasPermission, setPermissionList, setMenusList, load, clear }
}
