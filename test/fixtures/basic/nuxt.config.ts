import PermissionModule from '../../../src/module'

export default defineNuxtConfig({
    modules: [
        PermissionModule,
    ],
    permission: {
        // Only the index page stays static; the rest (/admin/secret) is dynamic
        static: ['/'],
    },
})
