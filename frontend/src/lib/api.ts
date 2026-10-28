/**
 * Cliente del API REST (backend Go, ver `backend/`).
 *
 * El frontend no habla con Supabase: toda lectura/escritura pasa por
 * `VITE_API_URL`. En desarrollo Vite proxya `/api` a `http://localhost:8080`,
 * así que dejar la variable vacía también funciona.
 */

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, '') ?? ''

/** `true` cuando hay una URL de API configurada o se usa el proxy de Vite. */
export const isApiConfigured = import.meta.env.DEV || API_BASE_URL.length > 0

export class ApiError extends Error {
  readonly status: number
  readonly code?: string

  constructor(status: number, message: string, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  token?: string
}

type ApiErrorPayload = {
  error?: string
  code?: string
}

/** Petición JSON al API con manejo de errores uniforme. */
export async function apiFetch<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { body, token, headers, ...rest } = options

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (response.status === 204) {
    return undefined as T
  }

  const payload: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const detail = payload as ApiErrorPayload | null
    throw new ApiError(
      response.status,
      detail?.error ?? 'La petición al API falló',
      detail?.code,
    )
  }

  return payload as T
}
