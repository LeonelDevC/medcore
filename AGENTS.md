# AGENT.md — Contexto para agentes

Este archivo vive en la **raíz** del proyecto (`D:\git\hospital\AGENT.md`) y es
el único punto de entrada para agentes. **No se mezcla con `spect/`**: no se
mueve allí, no se duplica allí y no se crean copias dentro de `spect/`.

## Fuente de verdad

Toda especificación está en `spect/`:

- `spect/especificaciones-ssd.md` — SSDD: diseño, tokens, componentes, módulos,
  permisos y criterios de aceptación C1–C12. Es el documento raíz.
- `spect/plan.md` — plan derivado: fases F0–F6, tareas, dependencias y verificación.

Reglas de trabajo:

- Se leen antes de tocar código. Ante cualquier duda de diseño o alcance, manda
  `especificaciones-ssd.md`.
- **No se modifican los archivos de `spect/`** salvo petición explícita del
  usuario. Si el código contradice las specs, se reporta; no se "arreglan" las
  specs para que encajen con el código.
- Si algo no está en `spect/`, está fuera de alcance: se pregunta antes de
  añadirlo. El riesgo principal del proyecto es la sobrecarga de alcance.

## Stack

- **Frontend:** React + Vite + Tailwind CSS. SPA, sin SSR.
- **Backend:** Supabase (auth email+password, Postgres con RLS, Storage privado
  para DICOM con URLs firmadas). Sin backend propio en el MVP.
- **Tema:** tokens CSS expuestos a Tailwind, alternados con
  `data-theme="light|dark"` en `<html>`.
- **Dependencias:** instalar desde el lockfile (`npm ci`). No regenerar
  lockfiles ni añadir paquetes por iniciativa propia.

> Bloqueo conocido: el visor DICOM necesita una librería de parseo/render
> (p. ej. cornerstone3D o dicom-parser). Está **pendiente de aprobación del
> usuario** (specs §10 S3, plan T4.1). No se instala sin esa aprobación.

## Reglas visuales (no negociables)

Se verifican con los criterios C1–C6 de las specs:

- **Minimalista:** sin decoración superflua, sin gradientes, sin glassmorphism,
  sombra máxima `0 1px 2px`.
- **Paleta azul claro** con tokens (`--bg`, `--surface`, `--primary`…). El azul
  es el único color de marca; éxito/aviso/error solo como color semántico.
- **Sin navbar genérico:** navegación por sidebar colapsable (icono + etiqueta).
  Nada de barra horizontal logo+links+CTA.
- **Sin buscador propio:** no hay búsqueda global. Solo filtros contextuales
  por sección (chips).
- **Sin puntos de color pequeños:** prohibido badge/chip con dot de color y
  texto < 12px. Estados = texto + color semántico o icono, mínimo 12px.
- **Sin fondos de color que rompan el tono:** los fondos de sección son siempre
  `--bg` o `--surface`. Separación por espacio y líneas sutiles.
  *Única excepción:* el viewport del visor DICOM, fondo neutro oscuro por
  contraste diagnóstico (specs §2.6/T6).
- **Cero colores literales en componentes:** ningún hex ni `rgb()` fuera del
  archivo de tokens (regla T3). Romper esto rompe el tema oscuro.
- **Tema claro y oscuro obligatorios desde el MVP**, sin destello en el primer
  paint (script inline en `index.html`), elección persistida en `localStorage`.

## Módulos del MVP (M1–M7)

| ID | Módulo | Nota |
|---|---|---|
| M1 | Autenticación | login, recuperación, logout; rol en `profiles` + RLS |
| M2 | Dashboard | resumen del día, accesos rápidos según rol |
| M3 | Pacientes | listado paginado, ficha (citas, notas, estudios, informes), CRUD |
| M4 | Citas | calendario/listado, estados programada/realizada/cancelada |
| M5 | Personal médico | listado, ficha, especialidad; **solo admin** |
| M6 | Visor DICOM | carga manual de `.dcm`/ZIP (no PACS), ventana/nivel, mediciones |
| M7 | Informes médicos | borrador editable → firmado inmutable; corrección por adenda |

Fuera de alcance: facturación, farmacia, laboratorio, EHR detallado,
integración HIS/PACS, reconstrucción 3D/MPR, firma digital certificada, app
nativa, multi-idioma completo.

## Roles y permisos

Solo **admin** y **médico**. No existen enfermería ni recepción.

- `admin`: gestiona personal, pacientes y citas; ve todos los informes; **no**
  carga DICOM ni edita mediciones ni crea informes.
- `medico`: pacientes y agenda propios; carga estudios, crea mediciones y
  crea/firma informes propios.

La UI oculta lo que no corresponde, pero **la base de datos lo impide** (RLS).
Verificar con dos sesiones de rol distinto; no basta con ocultar botones.
Los items de navegación sin permiso no se renderizan (no se deshabilitan).

## Accesibilidad

WCAG 2.1 AA básico: contraste ≥ 4.5:1 en texto normal y ≥ 3:1 en texto grande
y componentes de UI, en **ambos temas**; foco visible en todos los
interactivos; navegación completa por teclado. Se verifica con axe y
Lighthouse (criterio C8).

## Estado actual del proyecto

Ahora mismo el repo solo contiene documentación (`spect/` + este archivo): no
hay `package.json` ni código todavía, así que la fase activa es **Fase 0**
(setup). Los comandos de abajo aplican en cuanto exista el proyecto; no
inventar su salida ni darlos por pasados sin haberlos ejecutado.

## Verificación antes de dar algo por terminado

```bash
npm ci
npm run dev     # arranca
npm run build   # debe terminar limpio (C10)
npm run lint
```

No hay otros comandos garantizados: si el proyecto no define tests, decirlo en
vez de fingir verificación. Checklist mínimo: C10 (arranca y build limpio) y,
si se tocó UI, los criterios visuales C1–C6 aplicables. Nunca dar por hecho el
modo oscuro sin mirarlo (C11).

## Tests E2E (Playwright)

Los flujos de specs §7 son **obligatorios** como test E2E. No son opcionales ni
"si da tiempo": C9 exige F1–F7 completos sin errores en consola.

- **F1–F4** (núcleo, mínimo exigible en cualquier entrega que toque UI):
  login → dashboard, admin registra paciente → crea cita, médico consulta
  agenda → ficha → nota, admin gestiona personal.
- **F5–F7** (aplican; entran cuando exista M6/M7 y el tema): DICOM con
  ventana/nivel y medición, informe borrador → firmado → solo lectura,
  cambio de tema persistido sin destello.
- **Ubicación:** `tests/e2e/` (o `e2e/` si el proyecto ya usa esa raíz). Un
  archivo por flujo (`f1-login.spec.ts`, `f2-paciente-cita.spec.ts`, …).
- **Dos roles siempre:** cada flujo se prueba con la sesión que le corresponde
  y, donde aplique, se comprueba que el otro rol **no** ve ni puede la acción
  (RLS, no solo botones ocultos). admin y médico; no hay otros roles.

Comandos:

```bash
npx playwright test
npx playwright show-report
```

Requisitos de cada test:

- **Cero errores en consola** (`console.error` y page errors fallan el test).
  Un `warning` se revisa; un `error` se corrige, no se silencia.
- **C1–C12 repasados** en lo que el flujo toque: visuales (C1–C6) por snapshot
  o aserción de tokens, navegación (C7), accesibilidad (C8), tema (C11) y
  DICOM/informes (C12) donde corresponda.
- Tono **minimalista** también en los tests: nada de utilidades de estilo
  propias ni capturas decorativas. El test no introduce colores, gradientes ni
  componentes que rompan C1–C6.
- Datos de prueba aislados y reversibles; no tocar datos reales del proyecto
  Supabase.

> Bloqueo conocido: `@playwright/test` y sus navegadores (`npx playwright
> install`) son una dependencia nueva. **Pendiente de aprobación del usuario**;
> no se instala por iniciativa propia. Mientras no esté, C9 se verifica a mano
> y se dice que fue manual.
