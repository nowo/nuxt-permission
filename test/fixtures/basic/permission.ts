// SSR fixture: token via cookie (readable on the server). Register dynamic routes only when the `auth` cookie is present.
export default definePermissionSource(({ setPermissionList, setMenusList }) => {
    const authed = useCookie('auth').value
    if (!authed) return []

    // cb omitted: backend data is already in shape (identity default)
    const tree = normalizeMenus([
        { id: 1, name: 'secret', path: '/admin/secret', type: 'menu', children: [] },
        // group: /section has its own page (section/index.vue) and a child /section/a
        { id: 2, name: 'section', path: '/section', type: 'menu', children: [
            { id: 3, name: 'section-a', path: '/section/a', type: 'menu', children: [] },
        ] },
        // param page, backend uses bracket syntax `[id]` → matches pages/detail/[id].vue
        { id: 4, name: 'detail', path: '/detail/[id]', type: 'menu', children: [] },
        // nested param page (pages/nest.vue + pages/nest/[id].vue), backend uses `:id` syntax
        { id: 5, name: 'nest', path: '/nest/:id', type: 'menu', children: [] },
        // external link — not registered as a route
        { id: 6, name: 'gh', path: 'https://github.com/', type: 'menu', children: [] },
        // path with query — registers the pathname /report, keeps the query for the sidebar link
        { id: 7, name: 'report', path: '/report?range=7d', type: 'menu', children: [] },
    ])
    setPermissionList(['secret-view'])
    setMenusList(tree)
    return tree
})
