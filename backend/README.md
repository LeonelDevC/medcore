# Backend — API REST (Go)

API del MVP hospitalario. Sin frameworks ni dependencias externas: solo
biblioteca estándar (`net/http`, `log/slog`, `encoding/json`), de modo que
`go build` no necesita descargar nada.

## Arranque

```bash
cd backend
go run ./cmd/api          # escucha en :8080
go build ./...            # compila todos los paquetes
go vet ./...              # análisis estático
```

Variables de entorno (ver `.env.example`):

| Variable | Por defecto | Para qué |
|---|---|---|
| `APP_ENV` | `development` | entorno lógico |
| `API_ADDR` | `:8080` | dirección de escucha |
| `API_ALLOWED_ORIGIN` | `http://localhost:5173` | origen permitido por CORS |
| `API_TOKENS` | vacío | tokens `token:rol` separados por coma |
| `DATABASE_URL` | vacío | vacío = repositorio en memoria |

Sin `API_TOKENS`, `/healthz` responde y `/api/*` devuelve 401: es un fallo
seguro, no un modo abierto.

## Estructura

```
cmd/api/            punto de entrada; inyecta dependencias a mano
internal/
  config/           lectura y validación del entorno
  models/           entidades y estados del dominio
  repository/       puertos (interfaces) de persistencia
  repository/memory implementación en memoria del MVP
  services/         reglas de negocio y validación
  handlers/         HTTP: decodifica, llama al servicio, responde JSON
  middleware/       auth, roles, CORS, logs, recuperación de panics
  routes/           árbol de rutas + permisos por rol
pkg/
  database/         selección del motor de persistencia
  utils/            IDs opacos y parseo de fechas
```

La dirección de dependencias es siempre hacia dentro:
`handlers -> services -> repository <- repository/memory`. Ni handlers ni
servicios conocen un driver.

## Permisos

El rol viaja en un token de `API_TOKENS` y se comprueba en `routes.go`, según
la matriz de las especificaciones:

- `admin`: pacientes, citas, personal (M5), lectura de estudios e informes.
- `medico`: pacientes, citas, estudios/mediciones (M6) e informes (M7).

```bash
# token de desarrollo del .env.example
curl -H "Authorization: Bearer dev-admin-token" http://localhost:8080/api/v1/pacientes
```

> `API_TOKENS` es un **sustituto temporal de JWT** para poder probar ambos
> roles sin añadir dependencias. Cuando exista login real se cambia solo
> `middleware.Auth`; los permisos por ruta ya están declarados.

## Rutas

| Método | Ruta | Roles |
|---|---|---|
| GET | `/healthz` | público |
| GET/POST | `/api/v1/pacientes` | admin, medico |
| GET/PUT/DELETE | `/api/v1/pacientes/{id}` | admin, medico |
| GET/POST | `/api/v1/citas` | admin, medico |
| GET | `/api/v1/citas/{id}` | admin, medico |
| PATCH | `/api/v1/citas/{id}` | admin, medico |
| GET/POST | `/api/v1/personal` | admin |
| GET/PUT | `/api/v1/personal/{id}` | admin |
| GET | `/api/v1/estudios`, `/api/v1/estudios/{id}` | admin, medico |
| GET | `/api/v1/pacientes/{id}/estudios` | admin, medico |
| POST | `/api/v1/pacientes/{id}/estudios` | medico |
| POST | `/api/v1/estudios/{id}/mediciones` | medico |
| GET | `/api/v1/informes`, `/api/v1/informes/{id}` | admin, medico |
| POST/PUT | `/api/v1/informes`, `/api/v1/informes/{id}` | medico |
| POST | `/api/v1/informes/{id}/firma` | medico |
| POST | `/api/v1/informes/{id}/adendas` | medico |

Notas de dominio ya implementadas:

- Cita: `programada` → `realizada`/`cancelada`; los estados finales no se reabren.
- Estudio: `pixelSpacing` en mm `[fila, columna]`; la distancia y el ángulo se
  calculan en el servidor y salen en `mm` con calibración o en `px`
  (`calibrada: false`) sin ella.
- Informe: `borrador` editable; al firmar queda inmutable y solo admite adendas.

## Pendiente (no resuelto a propósito)

1. **Persistencia real**: `repository/memory` se sustituye por Postgres cuando
   se elija driver; `pkg/database.Select` ya rechaza un `DATABASE_URL` sin
   driver en vez de caer a memoria en silencio.
2. **Autenticación real**: JWT/sesión y tabla de usuarios; hoy el token es una
   tabla estática.
3. **DICOM**: subida a storage y parseo quedan bloqueados hasta que se apruebe
   la librería correspondiente (specs §10 S3, plan T4.1). El API solo guarda
   metadatos y mediciones.
4. **Propiedad de datos del médico**: las consultas no filtran por profesional
   todavía; requiere usuarios reales.
