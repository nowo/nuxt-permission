---
seo:
  title: Backend-menu driven dynamic routes and permissions for Nuxt
  description: nuxt-permission strips non-whitelisted pages at build time and registers them
    from the backend menu after login. Ships permission state, hasPermission, and a menu-transform
    helper, with fully extensible types.
---

::u-page-hero
#title
Backend-driven routes & permissions for Nuxt

#description
Non-whitelisted pages are stripped from the route table at build time and registered from the backend menu **after login** — before that, the routes simply do not exist.

#links
  :::u-button
  ---
  color: neutral
  size: xl
  to: /en/getting-started/installation
  trailing-icon: i-lucide-arrow-right
  ---
  Get started
  :::

  :::u-button
  ---
  color: neutral
  icon: i-simple-icons-github
  size: xl
  to: https://github.com/nowo/nuxt-permission
  variant: outline
  ---
  Star on GitHub
  :::
::

::u-page-section
#title
Why nuxt-permission

#features
  :::u-page-feature
  ---
  icon: i-lucide-lock
  ---
  #title
  Truly dynamic

  #description
  Routes are absent from the table when logged out — not merely hidden on the client.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-folder-tree
  ---
  #title
  No views directory

  #description
  Pages stay in `pages/`; non-whitelisted ones become dynamic automatically.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-server
  ---
  #title
  SSR-safe

  #description
  Injected via `router.options`, registered before the first navigation.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-split
  ---
  #title
  Code-splitting works

  #description
  A bundler-visible `import()` manifest is generated at build time.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-boxes
  ---
  #title
  Batteries included

  #description
  `usePermissionState`, `hasPermission`, and the `normalizeMenus` helper.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-type
  ---
  #title
  Extensible types

  #description
  meta reuses `RouteMeta`; permission keys use the mergeable `PermissionMap`.
  :::
::
