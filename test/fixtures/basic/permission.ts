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
    ])
    setPermissionList(['secret-view'])
    setMenusList(tree)
    return tree
})
