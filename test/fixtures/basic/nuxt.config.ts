import PermissionModule from '../../../src/module'

export default defineNuxtConfig({
    modules: [
        PermissionModule,
    ],
    permission: {
        // Index stays static; the rest is dynamic. /protected/open is a whitelisted child under the
        // non-whitelisted parent layout /protected — it must survive the parent being stripped.
        static: ['/', '/protected/open'],
    },
})
