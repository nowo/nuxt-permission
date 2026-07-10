<script setup lang="ts">
import { usePermissionState } from 'nuxt-permission/vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../api/mock'
import { useToken } from '../composables/useToken'

const { setToken } = useToken()
const { load } = usePermissionState()
const router = useRouter()
const loading = ref(false)

async function onLogin() {
    loading.value = true
    try {
        const { token } = await login()
        setToken(token) // Persist only the token
        await load() // Library: run the source, write state, register routes
        await router.push('/dashboard')
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div>
        <h2>Login</h2>
        <p>Get a token (only the token is stored), then the source uses it to fetch permissions/menus and register the dynamic routes.</p>
        <button :disabled="loading" @click="onLogin">
            {{ loading ? 'Logging in…' : 'Login' }}
        </button>
    </div>
</template>
