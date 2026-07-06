import type { NuxtPage } from '@nuxt/schema'
import { existsSync } from 'node:fs'
import {
    addImportsDir,
    addTemplate,
    addTypeTemplate,
    createResolver,
    defineNuxtModule,
    extendPages,
} from '@nuxt/kit'

export type {
    PermissionButton,
    PermissionKey,
    PermissionMap,
    PermissionMenu,
    PermissionSource,
    PermissionSourceContext,
} from './runtime/types'

export interface ModuleOptions {
    /**
     * Master switch. When false, no route is stripped and no source is injected (all pages stay
     * static), but the composables are still registered and dynamic registration becomes a no-op —
     * consumer code will not throw.
     * @default true
     */
    enabled: boolean
    /**
     * Whitelist: routes that stay "static" (public, no login required). Glob, matched against `route.path`.
     * **Every page not in the whitelist becomes dynamic.** Glob: `/home/**` exposes the whole subtree.
     * @default ['/', '/login']
     */
    static: string | string[]
    /**
     * Data source file (relative to srcDir, extension omitted). Default-exports `definePermissionSource(...)`.
     * @default 'permission'
     */
    source: string
    /**
     * Extra fields to keep at the route level, in addition to the built-in RouteRecordRaw set (the rest go to meta).
     * @default []
     */
    routeFields: string[]
    /**
     * How a group node (a menu that has menu children) which ALSO has its own page behaves:
     * `'redirect'` (default) → redirect to its first child; `'navigate'` → render its own page.
     * A group without its own page always redirects to its first child.
     * @default 'redirect'
     */
    group: 'redirect' | 'navigate'
}

export default defineNuxtModule<ModuleOptions>({
    meta: {
        name: 'nuxt-permission',
        configKey: 'permission',
    },
    defaults: {
        enabled: true,
        static: ['/', '/login'],
        source: 'permission',
        routeFields: [],
        group: 'redirect',
    },
    setup(options, nuxt) {
        const { resolve } = createResolver(import.meta.url)
        const dynamicPages: NuxtPage[] = []

        // Expose options as a typed virtual module #nuxt-permission/options — a compile-time constant,
        // readable anywhere without Nuxt context (safe inside treeToRoutes at router-creation time).
        const optionsTpl = addTemplate({
            filename: 'nuxt-permission/options.mjs',
            write: true,
            getContents: () => `export const permissionOptions = ${JSON.stringify({ routeFields: options.routeFields, group: options.group })}\n`,
        })
        nuxt.options.alias['#nuxt-permission/options'] = optionsTpl.dst

        // Always register composables: even when enabled=false, consumer calls must not throw
        addImportsDir(resolve('./runtime/composables'))

        // Component manifest virtual module #nuxt-permission/manifest (empty when enabled=false → whole thing is a no-op)
        const manifest = addTemplate({
            filename: 'nuxt-permission/manifest.mjs',
            write: true,
            getContents: () => {
                const entries = dynamicPages.map((page) => {
                    const meta = JSON.stringify(page.meta ?? {})
                    return `    ${JSON.stringify(page.path)}: { name: ${JSON.stringify(page.name)}, meta: ${meta}, component: () => import(${JSON.stringify(page.file)}) },`
                }).join('\n')
                return `export const routeManifest = {\n${entries}\n}\n`
            },
        })
        nuxt.options.alias['#nuxt-permission/manifest'] = manifest.dst

        addTypeTemplate({
            filename: 'nuxt-permission/manifest.d.ts',
            getContents: () => `import type { RouteRecordRaw } from 'vue-router'
import type { PermissionButton, PermissionKey } from 'nuxt-permission'

declare module '#nuxt-permission/manifest' {
    export const routeManifest: Record<string, { name?: string, meta?: Record<string, unknown>, component: NonNullable<RouteRecordRaw['component']> }>
}
declare module '#nuxt-permission/options' {
    export const permissionOptions: { routeFields: string[], group: 'redirect' | 'navigate' }
}
declare module 'vue-router' {
    interface RouteMeta {
        // Uses PermissionKey: once the user extends PermissionMap the key narrows automatically (no need to redeclare RouteMeta)
        permission?: Partial<Record<PermissionKey, PermissionButton>>
    }
}
`,
        })

        // Source alias — always set so usePermissionState can import it; noop when disabled (or no user file)
        const userSource = resolve(nuxt.options.srcDir, options.source)
        const sourceFile = ['.ts', '.mts', '.js', '.mjs'].map(ext => userSource + ext).find(existsSync)
        nuxt.options.alias['#nuxt-permission/source'] = (options.enabled && sourceFile) ? sourceFile : resolve('./runtime/source.noop')

        // enabled=false: strip no routes and inject no router.options. All pages stay static.
        if (!options.enabled) return

        const whitelist = ([] as string[]).concat(options.static).map(globToRegExp)

        // Build time: strip non-whitelisted pages from the static route table, collecting their name/path/file/meta
        extendPages((pages) => {
            const walk = (list: NuxtPage[]) => {
                for (let i = list.length - 1; i >= 0; i--) {
                    const page = list[i]
                    if (!page) continue
                    if (page.children?.length) {
                        walk(page.children)
                    }
                    if (page.path && !whitelist.some(re => re.test(page.path))) {
                        dynamicPages.push({ name: page.name, path: page.path, file: page.file, meta: page.meta })
                        list.splice(i, 1)
                    }
                }
            }
            walk(pages)
        })

        // Inject router.options — the SSR-safe first-page registration point
        nuxt.hook('pages:routerOptions', ({ files }) => {
            files.push({ path: resolve('./runtime/router.options'), optional: true })
        })
    },
})

const RE_ESCAPE = /[.+^${}()|[\]\\]/g
const RE_GLOBSTAR = /\*\*/g
const RE_STAR = /\*/g
const RE_PLACEHOLDER = /\0/g

// Minimal glob → RegExp: `*` within a segment, `**` across segments, trailing `/**` also matches the dir itself
function globToRegExp(glob: string) {
    let source = glob
    let subtree = false
    if (source.endsWith('/**')) {
        source = source.slice(0, -3)
        subtree = true
    }
    source = source
        .replace(RE_ESCAPE, '\\$&')
        .replace(RE_GLOBSTAR, '\0')
        .replace(RE_STAR, '[^/]*')
        .replace(RE_PLACEHOLDER, '.*')
    return new RegExp(`^${source}${subtree ? '(?:/.*)?' : ''}$`)
}
