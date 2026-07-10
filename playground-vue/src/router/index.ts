import { createPermission, definePermissionSource, normalizePermissionMenus } from 'nuxt-permission/vue'
import { createRouter, createWebHistory } from 'vue-router'
import { fetchUser } from '../api/mock'
import { useToken } from '../composables/useToken'

// All routes are declared here with a `name` (that's what lets `static` harvest the protected ones).
// With unplugin-vue-router you'd instead pass `routes: autoRoutes` from 'vue-router/auto-routes'.
const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', name: 'home', component: () => import('../pages/index.vue') },
        { path: '/login', name: 'login', component: () => import('../pages/login.vue') },
        { path: '/dashboard', name: 'dashboard', component: () => import('../pages/dashboard.vue') },
        { path: '/menu', name: 'menu', component: () => import('../pages/menu.vue') },
    ],
})

// createPermission strips every non-whitelisted route off the router into a manifest and installs a
// one-shot guard that runs the source and re-registers them (for the granted user) on first navigation.
createPermission(router, {
    static: ['/', '/login'], // only these stay static; /dashboard and /menu register after login
    source: definePermissionSource(async ({ setPermissionList, setMenuList }) => {
        const { token } = useToken()
        if (!token.value) return [] // not logged in → register nothing

        const { permissions, menus } = await fetchUser(token.value)

        setPermissionList(permissions)

        // Backend uses type 1=menu / 2=button; mark buttons with the reserved _btn flag so they fold
        // into the parent's meta._permission (and drop hidden nodes).
        const tree = normalizePermissionMenus(menus, (v: any) => {
            if (v.isHideMenu) return false
            return { ...v, _btn: `${v.type}` === '2' }
        })

        setMenuList(tree)
        return tree
    }),
})

// Your own auth guard — the library only guarantees non-whitelisted routes don't exist before login.
router.beforeEach((to) => {
    const { token } = useToken()
    if (!token.value && to.matched.length === 0) return '/login'
})

export default router
