import { useCallback, useSyncExternalStore } from 'react'
import type { Theme } from '../types'

const STORAGE_KEY = 'theme'

const listeners = new Set<() => void>()
let globalListenersReady = false

function emit(): void {
  listeners.forEach((listener) => listener())
}

function readTheme(): Theme {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
}

function readStoredTheme(): Theme | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored === 'light' || stored === 'dark' ? stored : null
  } catch {
    // localStorage puede estar bloqueado (modo privado): se sigue al sistema.
    return null
  }
}

function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Aplica el tema en el DOM y, si `persist`, guarda la elección.
 * El atributo es la única fuente de verdad: `index.html` ya lo dejó puesto
 * antes del primer paint, así que no hay destello al recargar (T2).
 */
function applyTheme(theme: Theme, persist: boolean): void {
  const root = document.documentElement
  root.setAttribute('data-theme', theme)
  root.style.colorScheme = theme

  if (persist) {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Sin persistencia el tema sigue funcionando en esta pestaña.
    }
  }

  emit()
}

/** Otras pestañas y cambios del sistema (T1). Se registra una sola vez. */
function ensureGlobalListeners(): void {
  if (globalListenersReady || typeof window === 'undefined') return
  globalListenersReady = true

  window.addEventListener('storage', (event) => {
    if (event.key !== null && event.key !== STORAGE_KEY) return
    const stored = event.newValue
    applyTheme(stored === 'light' || stored === 'dark' ? stored : systemTheme(), false)
  })

  const media = window.matchMedia('(prefers-color-scheme: dark)')
  media.addEventListener('change', (event) => {
    // Solo se sigue al sistema si el usuario no ha fijado un tema.
    if (readStoredTheme()) return
    applyTheme(event.matches ? 'dark' : 'light', false)
  })
}

function subscribe(listener: () => void): () => void {
  ensureGlobalListeners()
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export type UseThemeResult = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

/** Tema actual + alternancia persistida en `localStorage` (T1, T2, C11). */
export function useTheme(): UseThemeResult {
  const theme = useSyncExternalStore(subscribe, readTheme, () => 'light' as Theme)

  const setTheme = useCallback((next: Theme) => applyTheme(next, true), [])

  const toggleTheme = useCallback(() => {
    applyTheme(readTheme() === 'dark' ? 'light' : 'dark', true)
  }, [])

  return { theme, setTheme, toggleTheme }
}
