<script setup lang="ts">
const { setToken } = useToken()
const { load } = usePermissionState()
const loading = ref(false)

async function onLogin() {
    loading.value = true
    try {
        const res = await $fetch<{ token: string }>('/api/login', { method: 'POST' })
        setToken(res.token) // Persist only the token (shared useState + localStorage)
        await load() // Library: run the source, write state, register routes
        await navigateTo('/dashboard')
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div>
        <h2>Login</h2>
        <p>Call <code>/api/login</code> to get a token (only the token is stored in localStorage), then the source uses it to call <code>/api/user</code> for permissions/menus.</p>
        <button :disabled="loading" @click="onLogin">
            {{ loading ? 'Logging in…' : 'Login' }}
        </button>
    </div>
</template>
