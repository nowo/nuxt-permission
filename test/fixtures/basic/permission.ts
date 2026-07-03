// SSR fixture: token via cookie (readable on the server). Register dynamic routes only when the `auth` cookie is present.
export default definePermissionSource(({ setPermissionList, setMenusList }) => {
    const authed = useCookie('auth').value
    if (!authed) return []

    // cb omitted: backend data is already in shape (identity default)
    const tree = normalizeMenus(
        [{ id: 1, name: 'secret', path: '/admin/secret', type: 'menu', children: [] }],
    )
    setPermissionList(['secret-view'])
    setMenusList(tree)
    return tree
})
