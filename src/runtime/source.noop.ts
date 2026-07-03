import type { PermissionSource } from './types'

// Fallback when the consumer provides no `<srcDir>/permission.ts`: register no dynamic routes.
const noopSource: PermissionSource = () => []

export default noopSource
