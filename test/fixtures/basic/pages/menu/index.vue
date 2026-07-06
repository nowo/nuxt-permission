<script setup>
const route = useRoute()
const perm = route.meta._permission || {}
const addFields = Object.keys(perm['menu-add'] || {})
</script>

<template>
    <div>
        <div>menu-page</div>
        <div>perm-keys:{{ Object.keys(perm).join(',') }}</div>
        <div>add-fields:{{ addFields.join(',') }}</div>
        <div>legacy-permission:{{ 'permission' in route.meta ? 'present' : 'absent' }}</div>
    </div>
</template>
