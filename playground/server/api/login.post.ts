// Mock login: a real app validates credentials and returns only a token; permissions/menus come from /api/user via the token.
export default defineEventHandler(() => {
    return { token: 'eyJhbGciOi' }
})
