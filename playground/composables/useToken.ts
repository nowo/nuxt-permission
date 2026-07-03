// Shared token: useState gives one reactive instance across the app (visible immediately),
// persisted to localStorage so it survives a refresh.
export function useToken() {
    const token = useState<string>('token', () => (import.meta.client ? localStorage.getItem('token') ?? '' : ''))

    function setToken(value: string) {
        token.value = value
        if (!import.meta.client) return
        if (value) {
            localStorage.setItem('token', value)
        } else {
            localStorage.removeItem('token')
        }
    }

    return { token, setToken }
}
