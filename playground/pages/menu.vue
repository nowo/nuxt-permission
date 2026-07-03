<script setup lang="ts">
const { permissions } = usePermissionState()
// hasPermission is auto-imported and usable directly in the template

const route = useRoute()
</script>

<template>
    <div>
        <h2>Menu management</h2>
        <p>Buttons controlled by permissions (menu-delete is not granted, so Delete is hidden):</p>
        <div style="display: flex; gap: 8px">
            <button v-if="hasPermission('menu-add')">
                <!-- typed correctly -->
                {{ route.meta?.permission?.['menu-add']?.name }}
            </button>
            <button v-if="hasPermission('menu-edit')">
                Edit
            </button>
            <button v-if="hasPermission('menu-delete')">
                Delete
            </button>
        </div>
        <p style="color: #888; margin-top: 12px">
            Current permissions: {{ permissions }}
        </p>
    </div>
</template>
