const RE_OPTIONAL = /\[\[(\.\.\.)?([^/\]]+)\]\]/g
const RE_BRACKET = /\[(\.\.\.)?([^/\]]+)\]/g
const RE_EMPTY_MATCHER = /:(\w+)\(\)/g
// External if it has a URL scheme (`mailto:`, `tel:`, `http:` …) or is protocol-relative (`//`).
// Route paths always start with `/`, so they never match.
const RE_EXTERNAL = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i
const RE_QUERY_HASH = /[?#]/

/** External link (`http(s)://`, protocol-relative `//`, or a scheme like `mailto:` / `tel:`) — not a registerable route. */
export function isExternalPath(path?: string): boolean {
    return !!path && RE_EXTERNAL.test(path)
}

/** Strip query/hash, keep only the pathname. */
export function toPathname(path: string): string {
    return path.split(RE_QUERY_HASH)[0] ?? path
}

/**
 * Resolve a route path against its parent: already-absolute or top-level paths pass through,
 * a relative child path (e.g. `:id()`) is prefixed with the parent (→ `/menu/:id()`).
 */
export function joinRoutePath(parent: string, path: string): string {
    return (path.startsWith('/') || !parent) ? path : `${parent}/${path}`
}

/**
 * Canonicalize a route path so the backend's `[id]` / `:id` and Nuxt's `:id()` all map to one key:
 * `[id]` → `:id`, `[...slug]` → `:slug(.*)*`, `:id()` → `:id`, and optional params
 * `[[id]]` → `:id?`, `[[...slug]]` → `:slug(.*)*` (converging with Nuxt's `:id?` / `:slug(.*)*`).
 */
export function canonicalPath(path: string): string {
    return path
        // Optional params first — must run before RE_BRACKET, which would otherwise mis-parse `[[id]]`
        .replace(RE_OPTIONAL, (_m, spread, name) => (spread ? `:${name}(.*)*` : `:${name}?`))
        .replace(RE_BRACKET, (_m, spread, name) => (spread ? `:${name}(.*)*` : `:${name}`))
        .replace(RE_EMPTY_MATCHER, ':$1')
}
