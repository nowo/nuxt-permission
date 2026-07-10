// Public entry for pure Vue 3 + vue-router SPAs: `import { ... } from 'nuxt-permission/vue'`.
// Same API as the Nuxt module (explicit imports instead of auto-imports), plus createPermission.
import type { PermissionButton, PermissionKey } from '../types'

// Type `route.meta._permission` for pure-Vue users too (the Nuxt module injects the same via addTypeTemplate).
declare module 'vue-router' {
    interface RouteMeta {
        // Uses PermissionKey: once the user extends PermissionMap the key narrows automatically
        _permission?: Partial<Record<PermissionKey, PermissionButton>>
    }
}

// definePermissionSource is a pure type helper — reuse the same one the Nuxt runtime ships.
export { definePermissionSource } from '../composables/definePermissionSource'
export type {
    PermissionButton,
    PermissionKey,
    PermissionMap,
    PermissionMenu,
    PermissionSource,
    PermissionSourceContext,
    RouteManifestEntry,
} from '../types'
export { createPermission } from './createPermission'
export type { CreatePermissionOptions } from './createPermission'
export { globToManifest, splitByStatic } from './manifest'

export type { GlobComponents } from './manifest'

export { hasPermission, normalizePermissionMenus, usePermissionState } from './store'
