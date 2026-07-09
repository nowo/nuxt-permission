<script setup>
const route = useRoute()
</script>

<template>
    <div>opt-page:{{ route.params.id || 'none' }}</div>
</template>
