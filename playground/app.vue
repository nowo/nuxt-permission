<script setup lang="ts">
import type { PermissionMenu } from 'nuxt-permission'

const { menus, clear } = usePermissionState()
const { token, setToken } = useToken()
const isLoggedIn = computed(() => !!token.value)

// Nav derived from reactive menus (menus is set after routes are registered, so links always resolve)
const navMenus = computed(() => menus.value.filter(m => m.path) as Array<PermissionMenu & { path: string }>)

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
