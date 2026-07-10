import type { PermissionKey, PermissionMenu } from '../types'
import { useRoute, useRouter, useState } from '#imports'
import { routeManifest } from '#nuxt-permission/manifest'
import { permissionOptions } from '#nuxt-permission/options'
import source from '#nuxt-permission/source'
import { createPermissionStore } from '../core/store'

/**
 * Permission / menu state. Token storage is up to the user; permissions and menus
 * live in memory (fetched from the server by the source on every load).
 */
export function usePermissionState() {
    return createPermissionStore({
        // useState keeps this SSR-safe and shared across every usePermissionState() call
        permissions: useState<PermissionKey[]>('nuxt-permission:permissions', () => []),
        menus: useState<PermissionMenu[]>('nuxt-permission:menus', () => []),
        // Reactive signal bumped after each registration pass. `router.getRoutes()` is not reactive,
        // so depend on this in a computed to re-read it: `computed(() => (void routesVersion.value, router.getRoutes()))`.
        routesVersion: useState('nuxt-permission:routes-version', () => 0),
        getRouter: useRouter,
        getRoute: useRoute,
        source,
        manifest: routeManifest,
        // narrowed back from string: the options virtual module is JSON, which widens the literal union
        group: (permissionOptions.group ?? 'redirect') as 'redirect' | 'navigate',
    })
}
