// Stand-in for a backend (no server in a pure SPA). Same shape/data as the Nuxt playground's
// server/api routes: login returns only a token; /user returns permissions + the menu tree.
// type: 1 = menu, 2 = button.

const delay = <T>(value: T) => new Promise<T>(resolve => setTimeout(resolve, 150, value))

export function login() {
    return delay({ token: 'eyJhbGciOi' })
}

export function fetchUser(token: string) {
    if (!token) return Promise.reject(new Error('401 Unauthorized'))
    return delay({
        permissions: ['menu-add', 'menu-edit', 'menu-view'],
        menus: [
            { id: 1, name: 'Dashboard', path: '/dashboard', type: 1, permission: '', children: [] },
            {
                id: 2,
                name: 'menu',
                path: '/menu',
                type: 1,
                permission: '',
                meta: { sort: 1 },
                children: [
                    { id: 3, name: 'Add', permission: 'menu-add', type: 2 },
                    { id: 4, name: 'Edit', permission: 'menu-edit', type: 2 },
                    { id: 5, name: 'Delete', permission: 'menu-delete', type: 2 },
                ],
            },
        ],
    })
}
