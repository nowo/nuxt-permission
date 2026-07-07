---
seo:
  title: 面向 Nuxt 的后端菜单驱动动态路由与权限
  description: nuxt-permission 在构建期摘除非白名单页面，登录后再从后端菜单注册。内置权限状态、hasPermission
    与菜单转换助手，类型完全可扩展。
---

::u-page-hero
#title
后端驱动的 Nuxt 路由与权限

#description
非白名单页面在构建期从路由表摘除，登录后从后端菜单注册——在此之前这些路由根本不存在。

#links
  :::u-button
  ---
  color: neutral
  size: xl
  to: /zh/getting-started/installation
  trailing-icon: i-lucide-arrow-right
  ---
  开始使用
  :::

  :::u-button
  ---
  color: neutral
  icon: i-simple-icons-github
  size: xl
  to: https://github.com/nowo/nuxt-permission
  variant: outline
  ---
  在 GitHub 上加星
  :::
::

::u-page-section
#title
为什么选 nuxt-permission

#features
  :::u-page-feature
  ---
  icon: i-lucide-lock
  ---
  #title
  真正的动态路由

  #description
  登出时路由从路由表中彻底消失，而不只是在客户端隐藏。
  :::

  :::u-page-feature
  ---
  icon: i-lucide-folder-tree
  ---
  #title
  无需 views 目录

  #description
  页面仍放在 `pages/`；非白名单页面自动转为动态路由。
  :::

  :::u-page-feature
  ---
  icon: i-lucide-server
  ---
  #title
  SSR 安全

  #description
  通过 `router.options` 注入，在首次导航前完成注册。
  :::

  :::u-page-feature
  ---
  icon: i-lucide-split
  ---
  #title
  代码分割生效

  #description
  构建期生成打包器可见的 `import()` manifest。
  :::

  :::u-page-feature
  ---
  icon: i-lucide-boxes
  ---
  #title
  开箱即用

  #description
  `usePermissionState`、`hasPermission` 与 `normalizePermissionMenus` 助手。
  :::

  :::u-page-feature
  ---
  icon: i-lucide-type
  ---
  #title
  类型可扩展

  #description
  meta 复用 `RouteMeta`；权限 key 用可合并的 `PermissionMap`。
  :::
::
