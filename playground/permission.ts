// Data source: SPA first, token stored in localStorage. Called by the library on first load/refresh,
// and by usePermissionState().load() after login.
export default definePermissionSource(async ({ setPermissionList, setMenusList }) => {
    const { token } = useToken()
    if (!token.value) return []

    const { permissions, menus } = await $fetch<{ permissions: string[], menus: any[] }>('/api/user', {
        headers: { authorization: `Bearer ${token.value}` },
    })

    setPermissionList(permissions)

    // Backend uses type 1=menu / 2=button; mark buttons with the reserved _btn flag
    const tree = normalizeMenus(menus, (v: any) => {
        if (v.isHideMenu) return false
        return { ...v, _btn: `${v.type}` === '2' }
    })

    setMenusList(tree)
    return tree
})
