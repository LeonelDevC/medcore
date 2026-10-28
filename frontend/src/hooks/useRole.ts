import { useSyncExternalStore } from 'react'
import { getRole, subscribeRole } from '../lib/session'
import type { Role } from '../types'

/** Rol actual de la sesión (placeholder de Fase 0, ver lib/session.ts). */
export function useCurrentRole(): Role | null {
  return useSyncExternalStore(subscribeRole, getRole, () => null)
}
