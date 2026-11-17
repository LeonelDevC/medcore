# AGENT.md — Contexto para agentes

Este archivo vive en la **raíz** del proyecto (`D:\git\hospital\AGENT.md`) y es
el único punto de entrada para agentes. **No se mezcla con `specs/`**: no se
mueve allí, no se duplica allí y no se crean copias dentro de `specs/`.

## Fuente de verdad y Constitución

Toda especificación y directriz fundamental reside en `specs/`:

- `specs/constitution.md` — **Constitución del Sistema**: Ley suprema inmutable.
  Establece los principios clínicos, las reglas visuales no negociables (R1–R7),
  la seguridad forzada en base de datos (RLS) y los límites estrictos del MVP.
- `specs/especificaciones-ssd.md` — SSDD: diseño, tokens, componentes, módulos,
  permisos y criterios de aceptación C1–C12. Es el documento raíz de desarrollo.
- `specs/plan.md` — Plan derivado: fases F0–F6, tareas, dependencias y verificación.

Reglas de trabajo:

- Se leen antes de tocar código. Ante cualquier duda de diseño o alcance, manda
  la Constitución (`constitution.md`) y las especificaciones (`especificaciones-ssd.md`).
- **No se modifican los archivos de `specs/`** salvo petición explícita del
  usuario. Si el código contradice las specs, se reporta; no se "arreglan" las
  specs para que encajen con el código.
- Si algo no está en `specs/`, está fuera de alcance: se pregunta antes de
  añadirlo. El riesgo principal del proyecto es la sobrecarga de alcance.

## Elephant-Goldfish Model (EGM) y Uso Obligatorio de Graphify

El flujo de trabajo adopta el modelo **Elephant-Goldfish (EGM)** asistido por **Graphify**:

1. **El Elefante (Arquitecto / Redactor de Specs):** Mantiene la visión holística
   y redacta/actualiza las especificaciones y planes.
2. **Los Peces Dorados (Goldfish / Revisores con Ojos Frescos):** Subagentes sin
   memoria previa (`egm-codebase-details`, `egm-design`, `egm-structural`, etc.)
   que auditan la propuesta de forma implacable.
3. **Uso Obligatorio de Graphify:**
   - **Tanto el Elefante como los Goldfish deben consultar Graphify siempre**
     (`graphify query "<pregunta>"`, `graphify path "<origen>" "<destino>"`)
     para validar la arquitectura, contratos entre frontend y backend, y evitar alucinaciones.
   - **Auto-actualización del grafo:** Si `graphify-out/graph.json` no existe o se han
     modificado archivos de código/specs, se debe ejecutar la actualización incremental:
     ```powershell
     & (Get-Content graphify-out\.graphify_python) -m graphify --update
     ```
     antes de responder o auditar.

## Uso por Defecto de REA (Reverse Engineer Anything)

Para cualquier tarea de análisis, inspección de dependencias externas, ingeniería
inversa de interfaces de usuario (web/móvil), reconstrucción de componentes,
comparación con sistemas externos o auditoría de paquetes/binarios para mejorar
este hospital, **Antigravity debe utilizar siempre por defecto la skill y herramientas
de REA (`reverse-engineer-anything`)**.

## Stack Real del Proyecto

- **Frontend:** React + Vite + TypeScript + SASS modular (`frontend/`).
  Tokens centralizados en `frontend/src/styles/tokens.sass`. Cero colores literales.
- **Backend:** Go (API REST sin dependencias externas, `backend/`).
  Modelos, servicios, repositorios y autenticación por tokens y roles.
- **Tema:** Tokens CSS/SASS expuestos con `data-theme="light|dark"` en `<html>`.
  Inicialización pre-paint en `frontend/index.html` sin destello visual.
- **Dependencias:** Instalar siempre desde el lockfile (`npm ci` en frontend).

## Reglas visuales (no negociables — Constitución Art. II)

Se verifican con los criterios C1–C6:

- **Minimalista:** Sin decoración superflua, sin gradientes, sin glassmorphism,
  sombra máxima `0 1px 2px` (`--shadow`).
- **Paleta azul claro:** El azul es el único color de marca; éxito/aviso/error solo
  como color semántico en texto/icono o pequeñas superficies (`--*-bg`).
- **Sin navbar genérico:** Navegación por sidebar colapsable (icono + etiqueta).
  Prohibida la barra horizontal logo+links+CTA.
- **Sin buscador propio:** No hay búsqueda global. Solo filtros contextuales
  por sección (chips).
- **Sin puntos de color pequeños:** Prohibido badge/chip con dot de color y
  texto < 12px. Estados = texto explícito $\ge$ 12px + color semántico o icono.
- **Sin fondos de color que rompan el tono:** Fondos de sección siempre `--bg` o
  `--surface`. Separación por espacio y líneas sutiles.
  *Única excepción:* Viewport del visor DICOM (fondo neutro oscuro).
- **Cero colores literales:** Ningún hex ni `rgb()` fuera de tokens.
- **Tema claro y oscuro obligatorios:** Persistido en `localStorage`, sin flash.

## Módulos del MVP (M1–M7)

| ID | Módulo | Nota |
|---|---|---|
| M1 | Autenticación | Login, recuperación, logout; rol y permisos |
| M2 | Dashboard | Resumen del día, accesos rápidos según rol |
| M3 | Pacientes | Listado paginado, ficha (citas, notas, estudios, informes), CRUD |
| M4 | Citas | Calendario/listado, estados finales inmutables |
| M5 | Personal médico | Listado, ficha, especialidad; **solo admin** |
| M6 | Visor DICOM | Carga manual de `.dcm`/ZIP (no PACS), ventana/nivel, mediciones calibradas |
| M7 | Informes médicos | Borrador editable → firmado inmutable; adendas referenciadas |

Fuera de alcance: facturación, farmacia, laboratorio, EHR detallado,
integración HIS/PACS, reconstrucción 3D/MPR, firma digital externa, app
nativa, multi-idioma completo.

## Roles y permisos

Solo **admin** y **médico**.

- `admin`: gestiona personal, pacientes y citas; ve informes; **no**
  carga DICOM ni edita mediciones ni crea informes.
- `medico`: pacientes y agenda propios; carga estudios, crea mediciones y
  crea/firma informes propios.

La UI oculta lo que no corresponde, pero **la base de datos y la API lo impiden**.
Los items de navegación sin permiso no se renderizan (no se deshabilitan).

## Accesibilidad

WCAG 2.1 AA: contraste $\ge$ 4.5:1 en texto normal y $\ge$ 3:1 en texto grande
y componentes, en ambos temas; foco visible en interactivos; navegación por teclado.

## Verificación antes de dar algo por terminado

```bash
# Frontend
cd frontend
npm ci
npm run dev     # arranca
npm run build   # debe terminar limpio (C10)
npm run lint

# Backend
cd ../backend
go vet ./...
go test ./...
```

Checklist mínimo: C10 (arranca y build limpio) y criterios visuales C1–C6.
Verificar siempre el modo oscuro (C11).

## Tests E2E (Playwright)

Flujos obligatorios en `frontend/e2e/`:
- **F1–F4:** Login → dashboard, admin registra paciente y cita, médico consulta agenda y ficha, admin gestiona personal.
- **F5–F7:** DICOM con ventana/nivel y medición, informe borrador → firmado → solo lectura, cambio de tema sin destello.
