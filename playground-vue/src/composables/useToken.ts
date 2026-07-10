import { ref } from 'vue'

// Shared token: a module-scoped ref is the pure-Vue equivalent of Nuxt's useState — one reactive
// instance across the app — persisted to localStorage so it survives a refresh.
const token = ref<string>(localStorage.getItem('token') ?? '')

export function useToken() {
    function setToken(value: string) {
        token.value = value
        if (value) {
            localStorage.setItem('token', value)
        } else {
            localStorage.removeItem('token')
        }
    }

    return { token, setToken }
}
