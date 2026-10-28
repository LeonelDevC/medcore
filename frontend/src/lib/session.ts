import type { Role } from '../types'

type Listener = () => void

const listeners = new Set<Listener>()

/**
 * Rol de la sesión actual.
 *
 * Fase 0: valor de trabajo fijo para poder renderizar el sidebar por rol.
 * T3.1 lo sustituye por la sesión que devuelve el API Go (`POST /api/v1/auth/login`);
 * hasta entonces esto NO es un control de acceso: la autorización vive en el
 * backend, que responde 403 a quien no tiene el rol.
 */
let role: Role | null = 'admin'

export function getRole(): Role | null {
  return role
}

export function setRole(next: Role | null): void {
  if (next === role) return
  role = next
  listeners.forEach((listener) => listener())
}

export function subscribeRole(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
