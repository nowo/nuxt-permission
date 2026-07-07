import { describe, expect, it } from 'vitest'
import { canonicalPath, isExternalPath } from '../src/runtime/utils/path'

describe('isExternalPath', () => {
    it('treats URL schemes and protocol-relative paths as external', () => {
        expect(isExternalPath('http://example.com')).toBe(true)
        expect(isExternalPath('https://example.com')).toBe(true)
        expect(isExternalPath('//cdn.example.com')).toBe(true)
        expect(isExternalPath('mailto:a@b.com')).toBe(true)
        expect(isExternalPath('tel:+123')).toBe(true)
        expect(isExternalPath('sms:123')).toBe(true)
    })

    it('treats route paths as internal', () => {
        expect(isExternalPath('/menu')).toBe(false)
        expect(isExternalPath('/menu/:id')).toBe(false)
        expect(isExternalPath('/detail/[id]')).toBe(false)
        expect(isExternalPath(':id()')).toBe(false)
        expect(isExternalPath('')).toBe(false)
        expect(isExternalPath(undefined)).toBe(false)
    })
})

describe('canonicalPath', () => {
    it('unifies bracket, colon and Nuxt matcher forms to one key', () => {
        expect(canonicalPath('/menu/[id]')).toBe('/menu/:id')
        expect(canonicalPath('/menu/:id()')).toBe('/menu/:id')
        expect(canonicalPath('/menu/[...slug]')).toBe('/menu/:slug(.*)*')
        expect(canonicalPath('/menu/:slug(.*)*')).toBe('/menu/:slug(.*)*')
    })

    it('handles multi-param segments (already correct)', () => {
        expect(canonicalPath('/menu/[a]-[b]')).toBe('/menu/:a-:b')
        expect(canonicalPath('/menu/:a()-:b()')).toBe('/menu/:a-:b')
    })

    it('handles optional params, converging backend and Nuxt forms', () => {
        // optional single param: backend [[id]] and Nuxt :id? both canonicalize to :id?
        expect(canonicalPath('/menu/[[id]]')).toBe('/menu/:id?')
        expect(canonicalPath('/menu/:id?')).toBe('/menu/:id?')
        // optional catch-all: [[...slug]] and Nuxt :slug(.*)* both canonicalize to :slug(.*)*
        expect(canonicalPath('/menu/[[...slug]]')).toBe('/menu/:slug(.*)*')
    })
})
