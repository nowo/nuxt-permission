<script setup lang="ts">
const { token } = useToken()
const isLoggedIn = computed(() => !!token.value)
</script>

<template>
    <div>
        <h2>Home (static route)</h2>
        <p v-if="!isLoggedIn">
            Not logged in —— <NuxtLink to="/login">
                go to login
            </NuxtLink>
            , then the non-whitelisted pages (/dashboard, /menu) get registered.
        </p>
        <p v-else>
            Logged in. You can visit
            <NuxtLink to="/dashboard">
                /dashboard
            </NuxtLink>
            and
            <NuxtLink to="/menu">
                /menu
            </NuxtLink>
            . A refresh re-fetches and re-registers them from the server.
        </p>
    </div>
</template>
