// Current user's permissions and menus: requires a token (server is the source of truth; the client can't forge it). type: 1=menu / 2=button.
export default defineEventHandler((event) => {
    const auth = getHeader(event, 'authorization')
    if (!auth?.startsWith('Bearer ')) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    return {
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
    }
})
