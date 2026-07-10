<script setup lang="ts">
import { computed } from 'vue'
import { useToken } from '../composables/useToken'

const { token } = useToken()
const isLoggedIn = computed(() => !!token.value)
</script>

<template>
    <div>
        <h2>Home (static route)</h2>
        <p v-if="!isLoggedIn">
            Not logged in ——
            <RouterLink to="/login">
                go to login
            </RouterLink>
            , then the non-whitelisted pages (/dashboard, /menu) get registered.
        </p>
        <p v-else>
            Logged in. You can visit
            <RouterLink to="/dashboard">
                /dashboard
            </RouterLink>
            and
            <RouterLink to="/menu">
                /menu
            </RouterLink>
            . A refresh re-fetches and re-registers them from the source.
        </p>
    </div>
</template>
