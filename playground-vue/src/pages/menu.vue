<script setup lang="ts">
import { hasPermission, usePermissionState } from 'nuxt-permission/vue'
import { useRoute } from 'vue-router'

const { permissions } = usePermissionState()
const route = useRoute()
// hasPermission is imported explicitly (no auto-imports in a pure Vue app) so the template can use it.
</script>

<template>
    <div>
        <h2>Menu management</h2>
        <p>Buttons controlled by permissions (menu-delete is not granted, so Delete is hidden):</p>
        <div style="display: flex; gap: 8px">
            <button v-if="hasPermission('menu-add')">
                <!-- typed via PermissionButton -->
                {{ route.meta?._permission?.['menu-add']?.name }}
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
