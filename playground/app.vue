<script setup lang="ts">
const router = useRouter()
const route = useRoute()

const { menus, clear, routesVersion } = usePermissionState()
const { token, setToken } = useToken()
const isLoggedIn = computed(() => !!token.value)

// getRoutes() is NOT reactive — depend on routesVersion (bumped after each registration) to re-read it.
const routeList = computed(() => {
    void routesVersion.value
    return router.getRoutes().map(r => r.path)
})
watch(routeList, v => console.log('routeList (via routesVersion) :>> ', v), { immediate: true })

// Alternative: log route-table changes in afterEach (fires after each navigation)
router.afterEach((to) => {
    console.log('route :>> ', route)
    console.log('router.getRoutes() :>> ', router.getRoutes())
    console.log(`routes after → ${to.fullPath} :>> `, router.getRoutes().map(r => r.path))
})

// Nav derived from reactive menus (menus is set after routes are registered, so links always resolve)
const navMenus = computed(() => menus.value.filter(m => m.path))

function onLogout() {
    setToken('')
    clear()
    location.reload()
}
</script>

<template>
    <div style="font-family: sans-serif; padding: 16px">
        <h1>nuxt-permission playground</h1>

        <nav style="display: flex; gap: 12px; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #eee">
            <NuxtLink to="/">
                Home
            </NuxtLink>
            <template v-if="isLoggedIn">
                <NuxtLink v-for="m in navMenus" :key="m.path" :to="m.path">
                    {{ m.name }}
                </NuxtLink>
                <button style="margin-left: auto" @click="onLogout">
                    Logout
                </button>
            </template>
            <NuxtLink v-else to="/login" style="margin-left: auto">
                Login
            </NuxtLink>
        </nav>

        <NuxtPage />
    </div>
</template>
