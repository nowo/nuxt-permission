// SSR fixture: token via cookie (readable on the server). Register dynamic routes only when the `auth` cookie is present.
export default definePermissionSource(({ setPermissionList, setMenusList }) => {
    const authed = useCookie('auth').value
    if (!authed) return []

    // cb sets the reserved `_btn` marker so type:'button' nodes fold into the parent's meta._permission
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
        // second entry to the same page with a different query — deduped to one /report route
        { id: 70, name: 'report', path: '/report?range=all', type: 'menu', children: [] },
        // group whose children are ALL external links → nothing to redirect to, so the group
        // itself registers no route (must not crash addRoute with an empty redirect)
        { id: 8, name: 'links', path: '/links', type: 'menu', children: [
            { id: 9, name: 'gh2', path: 'https://github.com/', type: 'menu', children: [] },
            { id: 10, name: 'nuxt', path: 'https://nuxt.com/', type: 'menu', children: [] },
        ] },
        // same page as menu id 1, reached from a second entry — must register once (no duplicate route)
        { id: 11, name: 'secret-alt', path: '/admin/secret', type: 'menu', children: [] },
        // button folding: children marked _btn (via cb) fold into /menu's meta._permission
        { id: 20, name: 'menu', path: '/menu', type: 'menu', children: [
            { id: 21, name: 'Add', permission: 'menu-add', type: 'button' },
            { id: 22, name: 'Edit', permission: 'menu-edit', type: 'button' },
        ] },
    ], v => ({ ...v, _btn: `${v.type}` === 'button' }))
    setPermissionList(['secret-view'])
    setMenusList(tree)
    return tree
})
