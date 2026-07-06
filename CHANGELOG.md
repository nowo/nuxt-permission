# Changelog


## v1.1.2

[compare changes](https://github.com/nowo/nuxt-permission/compare/v1.1.1...v1.1.2)

### 🚀 Enhancements

- **module:** Handle query, external links and param/nested page paths ([e8691c2](https://github.com/nowo/nuxt-permission/commit/e8691c2))

### 🩹 Fixes

- **module:** Unregister dynamic routes on clear and dedupe on re-load ([ca0c8cc](https://github.com/nowo/nuxt-permission/commit/ca0c8cc))
- **module:** Skip group redirect when all children are external links ([8562ab0](https://github.com/nowo/nuxt-permission/commit/8562ab0))
- **module:** Dedupe dynamic routes by canonical path ([e40c59e](https://github.com/nowo/nuxt-permission/commit/e40c59e))
- **composable:** Treat empty permission array as no access ([e84c728](https://github.com/nowo/nuxt-permission/commit/e84c728))

### ✅ Tests

- **e2e:** Cover param, nested, query and external path handling ([cc27f4b](https://github.com/nowo/nuxt-permission/commit/cc27f4b))
- **e2e:** Cover a group whose children are all external links ([43f7aaf](https://github.com/nowo/nuxt-permission/commit/43f7aaf))
- **e2e:** Cover a shared page and multi-query menu entries ([17cce02](https://github.com/nowo/nuxt-permission/commit/17cce02))

### 🤖 CI

- **github:** Bump Node to 22 for Object.groupBy support ([ff756fe](https://github.com/nowo/nuxt-permission/commit/ff756fe))
- **github:** Run type check in CI ([c95bc20](https://github.com/nowo/nuxt-permission/commit/c95bc20))

### ❤️ Contributors

- Nowo ([@nowo](https://github.com/nowo))

## v1.1.1

[compare changes](https://github.com/nowo/nuxt-permission/compare/v1.1.0...v1.1.1)

### 🚀 Enhancements

- **module:** Expose routesVersion for reactive getRoutes() ([8d68e64](https://github.com/nowo/nuxt-permission/commit/8d68e64))
- **module:** Add group option (redirect/navigate) for group nodes ([f1cdbc7](https://github.com/nowo/nuxt-permission/commit/f1cdbc7))

### 🩹 Fixes

- **module:** Set source alias when disabled so usePermissionState resolves ([6b2dfec](https://github.com/nowo/nuxt-permission/commit/6b2dfec))

### 🏡 Chore

- **playground:** Demo routesVersion and menu alias ([b5e8c65](https://github.com/nowo/nuxt-permission/commit/b5e8c65))
- **release:** Force patch bump in release script ([79967b9](https://github.com/nowo/nuxt-permission/commit/79967b9))

### ✅ Tests

- **e2e:** Cover group redirect to first child ([641e7e8](https://github.com/nowo/nuxt-permission/commit/641e7e8))

### ❤️ Contributors

- Nowo ([@nowo](https://github.com/nowo))

## v1.1.0


### 🚀 Enhancements

- **module:** Backend-menu-driven dynamic routes and permission state ([8aa8ad4](https://github.com/nowo/nuxt-permission/commit/8aa8ad4))

### 📖 Documentation

- **readme:** Add English README and 中文 version ([e4d4d95](https://github.com/nowo/nuxt-permission/commit/e4d4d95))

### 🏡 Chore

- **init:** Initial commit ([b4d5bf9](https://github.com/nowo/nuxt-permission/commit/b4d5bf9))
- **eslint:** Adopt @wzo/eslint-config and reformat to house style ([b027096](https://github.com/nowo/nuxt-permission/commit/b027096))
- **playground:** Permission demo app and editor config ([c65bf83](https://github.com/nowo/nuxt-permission/commit/c65bf83))

### ✅ Tests

- **e2e:** Cover whitelist static and post-login dynamic routes ([7e4f6d6](https://github.com/nowo/nuxt-permission/commit/7e4f6d6))

### ❤️ Contributors

- Nowo ([@nowo](https://github.com/nowo))

