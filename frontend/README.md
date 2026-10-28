# Frontend — React + Vite + TypeScript + SASS

SPA del MVP hospitalario. **Sin Tailwind**: los estilos se escriben en SASS,
en la sintaxis indentada de `.sass`, y cada componente importa su propio
`.styles.sass`.

## Arranque

```bash
cd frontend
npm ci
npm run dev       # http://localhost:5173
npm run build     # tsc -b + vite build
npm run lint
```

`npm run dev` proxya `/api` a `http://localhost:8080` (backend Go), así que no
hace falta configurar nada para desarrollo. Para apuntar a otro host, define
`VITE_API_URL` en `frontend/.env` (ver `.env.example`).

## Estructura

```
src/
  components/
    ui/Button/            Button.tsx + Button.styles.sass
    ui/Card/              Card.tsx + Card.styles.sass
    ui/EmptyState/        EmptyState.tsx + EmptyState.styles.sass
    layout/Brand/         Brand.tsx + Brand.styles.sass
    layout/Sidebar/       Sidebar.tsx + Sidebar.styles.sass
    layout/ContentHeader/ ContentHeader.tsx + ContentHeader.styles.sass
    theme/ThemeToggle/    ThemeToggle.tsx + ThemeToggle.styles.sass
  layouts/AppLayout/      shell autenticado (sidebar + contenido)
  layouts/AuthLayout/     shell público (login)
  pages/                  una carpeta por página, con su .styles.sass
  hooks/                  useTheme, useRole
  lib/                    api (cliente del API Go), session, utils
  routes/                 router y navegación por rol
  styles/                 tokens.sass, mixins.sass, globals.sass
```

Reglas que sostienen esta estructura:

- **Un componente, una carpeta**: `NombreComponente/NombreComponente.tsx` +
  `NombreComponente.styles.sass`. El `.tsx` importa su SASS.
- **Nada de estilos de componente en `globals.sass`**: ahí solo hay reset, base
  tipográfica, foco y la utilidad `.sr-only`.
- **Colores solo en `styles/tokens.sass`**: los componentes usan
  `var(--token)`. Ningún hex ni `rgb()` fuera de tokens (regla T3).
- **Temas**: `[data-theme='light']` y `[data-theme='dark']` definen el mismo
  juego de tokens; el script inline de `index.html` aplica el tema antes del
  primer paint (sin destello).

## API

`src/lib/api.ts` es el único punto que habla con el backend:

```ts
import { apiFetch } from './lib/api'

const pacientes = await apiFetch<Paciente[]>('/api/v1/pacientes', { token })
```

No se usa Supabase desde el navegador: toda lectura y escritura pasa por el
API Go (`backend/`), que aplica los permisos por rol.

## Estado

Fase 0/1: layout, navegación, tema y componentes base listos; las páginas son
marcadores de posición hasta las fases M1–M7 del plan. El visor DICOM sigue
bloqueado por la aprobación de su librería de parseo (specs §10 S3 / T4.1).
