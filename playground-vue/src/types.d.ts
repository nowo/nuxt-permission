// Declaration merging: give hasPermission its permission-key types (demonstrates extensibility).
// Augment the package root — the /vue entry re-exports the same PermissionMap / PermissionButton.
declare module 'nuxt-permission' {
    interface PermissionMap {
        keys: 'menu-add' | 'menu-edit' | 'menu-view' | 'menu-delete'
    }
    interface PermissionButton {
        id: number
        name: string
    }
}

export {}
