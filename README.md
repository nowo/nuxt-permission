# nuxt-permission

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

**English** | [中文](./README.zh.md)

Backend menu / permission driven dynamic routes and permissions for Nuxt: non-whitelisted pages are stripped from the static route table at build time and registered from the backend menu **after login** — before that the routes simply do not exist. Ships permission state, `hasPermission`, and a menu-transform helper, with types extensible via declaration merging.

## Features

- 🔒 &nbsp;Truly dynamic: routes are absent from the table when logged out, not merely hidden on the client
- 🗂 &nbsp;No views directory: pages stay in `pages/`; non-whitelisted ones become dynamic automatically
- ⚡️ &nbsp;SSR-safe: injected via `router.options`, registered before the first `push`
- 🌲 &nbsp;Code-splitting works: a bundler-visible `import()` manifest is generated at build time
- 🧩 &nbsp;Batteries included: `usePermissionState` / `hasPermission` / `normalizeMenus`
- 🅣 &nbsp;Extensible types: meta reuses `RouteMeta`, permission keys use the mergeable `PermissionMap`

## Install

```bash
npx nuxt module add nuxt-permission
# or
pnpm add -D nuxt-permission
```

## Configuration

```ts
// nuxt.config.ts
export default defineNuxtConfig({
    modules: ['nuxt-permission'],
    permission: {
        enabled: true,
        static: ['/', '/login'], // Whitelist of public static routes; the rest become dynamic
        // source: 'permission',  // Data source file (relative to srcDir, extension omitted), default permission.ts
        // routeFields: [],        // Extra fields to keep at the route level
    },
})
```

| Option | Type | Default | Description |
| :-- | :-- | :-- | :-- |
| `enabled` | `boolean` | `true` | Master switch; when `false` all pages stay static and consumer calls do not throw |
| `static` | `string \| string[]` | `['/', '/login']` | Whitelist; **everything else becomes dynamic**. Glob: `/home/**` exposes the whole subtree |
| `source` | `string` | `'permission'` | Data source file (relative to srcDir, extension omitted) |
| `routeFields` | `string[]` | `[]` | Extra fields kept at the route level in addition to the built-in RouteRecordRaw set |

## Usage

### 1. Data source `<srcDir>/permission.ts`

Read the auth state, fetch permissions/menus, write state, and return the menu tree. **The library calls it on first load/refresh, and you call `load()` after login** — the same source.

```ts
// app/permission.ts (SPA: token in localStorage; SSR: use useCookie)
export default definePermissionSource(async ({ setPermissionList, setMenusList }) => {
    const token = /* your own auth state */ useCookie('token').value
    if (!token) return []

    const { permissions, menus } = await $fetch('/api/user', {
        headers: { authorization: `Bearer ${token}` },
    })

    setPermissionList(permissions)
    const tree = normalizeMenus(menus, v => ({ ...v, type: `${v.type}` === '1' ? 'menu' : 'button' }))
    setMenusList(tree)
    return tree
})
```

### 2. Register after login

Token storage is up to you; after a successful login call `load()`, then navigate:

```ts
const { load } = usePermissionState()

async function onLogin() {
    await $fetch('/api/login', { method: 'POST' }) // You: obtain and store the token
    await load() // Library: run the source, write state, register routes
    await navigateTo('/dashboard')
}
```

### 3. Permission control: `v-if` + `hasPermission`

`hasPermission` is auto-imported and usable directly in templates (there is no `v-permission` directive):

```vue
<button v-if="hasPermission('menu-add')">Add</button>
<button v-if="hasPermission(['menu-edit', 'menu-view'])">Edit</button>        <!-- any match -->
<button v-if="hasPermission(['menu-edit', 'menu-view'], true)">Edit</button>  <!-- all match -->
```

> ⚠️ `hasPermission` is only a **UX layer, not a security boundary** — real authorization lives on the backend.

### 4. `normalizeMenus` menu transform

Turns the raw backend menu tree into route shape: `type: 'button'` is folded into the parent's `meta.permission` (key = the `permission` field, value = the whole button node); a node with menu children is treated as a group and `redirect`s to its first child; `cb` returning a falsy value drops the node and its subtree; a backend `meta` object is flattened into meta.

## Type extension (declaration merging)

meta reuses vue-router's `RouteMeta`; permission keys use the mergeable `PermissionMap`:

```ts
declare module 'vue-router' {
    interface RouteMeta {
        title?: string
        icon?: string
        // ... your meta fields; typed on both menu.meta and route.meta
    }
}

declare module 'nuxt-permission' {
    interface PermissionMap {
        keys: 'menu-add' | 'menu-edit' | 'menu-view' // hasPermission gets key completion
    }
    interface PermissionButton { // fields of the button node inside meta.permission
        id: number
        name: string
        permission: string
    }
}
```

> After extending `PermissionMap`, the keys of both `hasPermission('...')` and `route.meta.permission['...']` **narrow automatically** to your declared union. There is no need (and no way) to redeclare `RouteMeta.permission` to override it — interface declaration merging does not allow redefining the same property with a different type.

## i18n

The label layer is fully compatible (the library never touches `name`/`meta`; render the sidebar with `{{ $t(...) }}`). Routing layer: dynamic routes are registered at runtime with their raw path, so **`@nuxtjs/i18n` with `strategy: 'no_prefix'` is recommended**; prefix strategies together with runtime dynamic routes are a known limitation.

## Contribution

<details>
  <summary>Local development</summary>

  ```bash
  pnpm install
  pnpm dev:prepare   # generate type stubs
  pnpm dev           # develop with the playground
  pnpm lint
  pnpm test
  ```

</details>

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-permission/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/nuxt-permission

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-permission.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/nuxt-permission

[license-src]: https://img.shields.io/npm/l/nuxt-permission.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/nuxt-permission

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt
[nuxt-href]: https://nuxt.com
