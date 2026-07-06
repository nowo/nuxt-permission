# nuxt-permission

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

[English](./README.md) | **中文**

后端菜单/权限驱动的 Nuxt 动态路由与权限模块：白名单外的页在构建期从静态路由表摘除，**登录后**按后端菜单注册，未登录时路由根本不存在。内置权限状态、`hasPermission`、菜单转换助手，类型可声明合并扩展。

## 特性

- 🔒 &nbsp;真·动态注册：未登录时路由不在表里，而非仅前端隐藏
- 🗂 &nbsp;无需 views 目录：页照常写在 `pages/`，白名单外自动转动态
- ⚡️ &nbsp;SSR 安全：`router.options` 注入，首屏 `push` 之前完成注册
- 🌲 &nbsp;代码分割正常：构建期生成 bundler 可见的 `import()` 清单
- 🧩 &nbsp;权限一条龙：`usePermissionState` / `hasPermission` / `normalizeMenus`
- 🅣 &nbsp;类型可扩展：meta 复用 `RouteMeta`，权限 key 用可合并的 `PermissionMap`

## 安装

```bash
npx nuxt module add nuxt-permission
# 或
pnpm add -D nuxt-permission
```

## 配置

```ts
// nuxt.config.ts
export default defineNuxtConfig({
    modules: ['nuxt-permission'],
    permission: {
        enabled: true,
        static: ['/', '/login'], // 白名单：保持静态的公开路由，其余全部动态
        // source: 'permission',  // 数据源文件（相对 srcDir，省扩展名），默认 permission.ts
        // routeFields: [],        // 额外保留在 route 层的字段
        // group: 'redirect',      // 分组节点自带页面时：'redirect'（默认）| 'navigate'
    },
})
```

| 选项 | 类型 | 默认 | 说明 |
| :-- | :-- | :-- | :-- |
| `enabled` | `boolean` | `true` | 总开关；`false` 时所有页保持静态、消费方调用不报错 |
| `static` | `string \| string[]` | `['/', '/login']` | 白名单，**其余全部转动态**。glob：`/home/**` 整段公开 |
| `source` | `string` | `'permission'` | 数据源文件（相对 srcDir，省扩展名） |
| `routeFields` | `string[]` | `[]` | 在内置 RouteRecordRaw 字段外额外保留在 route 层的字段 |
| `group` | `'redirect' \| 'navigate'` | `'redirect'` | 分组节点（有 menu 子节点）且自带页面时：`redirect` 到第一个子菜单，或 `navigate` 渲染自身页面。无自带页面的分组一律重定向 |

## 用法

### 1. 数据源 `<srcDir>/permission.ts`

读登录态、拉权限/菜单、写状态、返回菜单树。**首屏/刷新库自动调，登录后 `load()` 调**，同一个源。

```ts
// app/permission.ts（SPA：token 存 localStorage；SSR 改用 useCookie）
export default definePermissionSource(async ({ setPermissionList, setMenusList }) => {
    const token = /* 你自己的登录态 */ useCookie('token').value
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

### 2. 登录后注册

token 存取归你；登录成功后调 `load()` 再跳转：

```ts
const { load } = usePermissionState()

async function onLogin() {
    await $fetch('/api/login', { method: 'POST' }) // 你：拿 token 存起来
    await load() // 库：跑数据源、写状态、注册路由
    await navigateTo('/dashboard')
}
```

### 3. 权限控制：`v-if` + `hasPermission`

`hasPermission` 独立自动导入，模板直接用（不做 `v-permission` 指令）：

```vue
<button v-if="hasPermission('menu-add')">新增</button>
<button v-if="hasPermission(['menu-edit', 'menu-view'])">编辑</button>        <!-- 任一命中 -->
<button v-if="hasPermission(['menu-edit', 'menu-view'], true)">编辑</button>  <!-- 全部命中 -->
```

> ⚠️ `hasPermission` 只是**体验层，不是安全边界**——真正鉴权在后端。

### 4. `normalizeMenus` 菜单转换

把后端原始菜单树转成路由形状：`type: 'button'` 折叠进父级 `meta.permission`（key = permission 字段，value = 整个按钮节点）；有 menu 子节点的视为分组，`redirect` 到第一个子菜单；`cb` 返回 falsy 排除该节点及子树；后端 `meta` 摊平进 meta。

**菜单 path 说明**

- **外链**（`http(s)://`、协议相对 `//`）：保留在菜单树但不注册为路由——侧边栏用 `<a>` 渲染（带 `meta._external` 标记）。
- **参数页**：后端 path 支持中括号或冒号两种写法——`/detail/[id]` 与 `/detail/:id` 都能命中 `pages/detail/[id].vue`。
- **带 query**：如 `/report?range=7d`，注册 pathname `/report`，完整值留给侧边栏链接。
- **去重**：同一页被多个菜单项指向时只注册一次（首个生效）；菜单树仍保留每个入口。

## 类型扩展（declaration merging）

meta 复用 vue-router 的 `RouteMeta`，权限 key 用可合并的 `PermissionMap`：

```ts
declare module 'vue-router' {
    interface RouteMeta {
        title?: string
        icon?: string
        // ... 你的 meta 字段，menu.meta / route.meta 都有类型
    }
}

declare module 'nuxt-permission' {
    interface PermissionMap {
        keys: 'menu-add' | 'menu-edit' | 'menu-view' // hasPermission 的 key 有补全
    }
    interface PermissionButton { // meta.permission 里 button 节点的字段
        id: number
        name: string
        permission: string
    }
}
```

> 扩展 `PermissionMap` 后，`hasPermission('...')` 与 `route.meta.permission['...']` 的 key 都会**自动收窄**为你声明的联合。无需（也无法）重声明 `RouteMeta.permission` 去覆盖——interface 声明合并不允许用不同类型重定义同名属性。

## i18n

菜单文案层完全兼容（库不碰 `name`/`meta`，侧边栏用 `{{ $t(...) }}` 即可）。路由层：动态路由是运行时注册的原始 path，**推荐 `@nuxtjs/i18n` 用 `strategy: 'no_prefix'`**；prefix 策略与运行时动态路由是已知限制。

## Contribution

<details>
  <summary>Local development</summary>

  ```bash
  pnpm install
  pnpm dev:prepare   # 生成类型 stub
  pnpm dev           # playground 开发
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
