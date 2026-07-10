<script setup lang="ts">
import { usePermissionState } from 'nuxt-permission/vue'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToken } from './composables/useToken'

const router = useRouter()

const { menus, clear, routesVersion } = usePermissionState()
const { token, setToken } = useToken()
const isLoggedIn = computed(() => !!token.value)

// getRoutes() is NOT reactive — depend on routesVersion (bumped after each registration) to re-read it.
const registeredPaths = computed(() => {
    void routesVersion.value
    return new Set(router.getRoutes().map(r => r.path))
})
const routeList = computed(() => [...registeredPaths.value])

// Only link to menu items whose route is already registered. The source sets `menus` before load()
// finishes addRoute(), so gating on registeredPaths avoids a transient RouterLink "No match" warning.
const navMenus = computed(() => menus.value.filter(m => m.path && registeredPaths.value.has(m.path)))

function onLogout() {
    setToken('')
    clear()
    location.reload()
}
</script>

<template>
    <div style="font-family: sans-serif; padding: 16px">
        <h1>nuxt-permission — Vue playground</h1>

        <nav style="display: flex; gap: 12px; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #eee">
            <!-- Home is a static route (always registered) — a plain link, not from the menu tree -->
            <RouterLink to="/">
                Home
            </RouterLink>
            <template v-if="isLoggedIn">
                <!-- dynamic pages come from the reactive menu tree (registered after login) -->
                <RouterLink v-for="m in navMenus" :key="m.path" :to="m.path!">
                    {{ m.name }}
                </RouterLink>
                <button style="margin-left: auto" @click="onLogout">
                    Logout
                </button>
            </template>
            <RouterLink v-else to="/login" style="margin-left: auto">
                Login
            </RouterLink>
        </nav>

        <RouterView />

        <p style="color: #aaa; margin-top: 24px; font-size: 12px">
            registered routes: {{ routeList.join(', ') }}
        </p>
    </div>
</template>
