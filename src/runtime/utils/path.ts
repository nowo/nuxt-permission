const RE_BRACKET = /\[(\.\.\.)?([^/\]]+)\]/g
const RE_EMPTY_MATCHER = /:(\w+)\(\)/g
const RE_EXTERNAL = /^(?:https?:)?\/\//
const RE_QUERY_HASH = /[?#]/

/** External link (`http(s)://` or protocol-relative `//`) — not a registerable route. */
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
 * `[id]` → `:id`, `[...slug]` → `:slug(.*)*`, `:id()` → `:id`.
 */
export function canonicalPath(path: string): string {
    return path
        .replace(RE_BRACKET, (_m, spread, name) => (spread ? `:${name}(.*)*` : `:${name}`))
        .replace(RE_EMPTY_MATCHER, ':$1')
}
