# Plan de implementación — MVP Hospitalario

## 0. Objetivo y referencia
- Objetivo: implementar el MVP hospitalario definido en `especificaciones-ssd.md`.
- Referencia: especificaciones-ssd.md (SSDD). Toda decisión de este plan se valida contra ese documento.
- Alcance: módulos M1-M7 con roles admin y médico (especificaciones, sección 6).

## 1. Stack y decisiones técnicas
- Frontend: **React + Vite + Tailwind CSS**. SPA, sin SSR.
- Backend: **Supabase** — auth (email+password), Postgres con RLS, Storage privado para DICOM (acceso por URLs firmadas). Sin backend propio en el MVP.
- Tema: variables CSS por token (especificaciones 2.6) expuestas a Tailwind; se alterna con `data-theme="light|dark"` en `<html>`.
- Roles: solo `admin` y `medico`, aplicados en RLS además de en la UI (la UI oculta, la base de datos impide).
- Restricciones de diseño que condicionan el código: sidebar en lugar de navbar, sin buscador global, sin colores literales en componentes.
- Dependencia pendiente: el visor DICOM necesita una librería de parseo/render (p. ej. cornerstone3D o dicom-parser). **No se instala sin aprobación explícita del usuario**; bloquea la fase 4.
- Dependencias del proyecto: instalar con el lockfile (`npm ci`). No regenerar lockfiles ni añadir paquetes por iniciativa propia.

## 2. Fases
- Fase 0: Setup (proyecto, tooling, tokens claro/oscuro, Supabase base)
- Fase 1: Design system (componentes base, iconos, ThemeToggle)
- Fase 2: Layout (sidebar, header de contenido, routing por rol)
- Fase 3: Módulos base (Auth, Dashboard, Pacientes, Citas, Personal)
- Fase 4: M6 Visor DICOM (carga, visor, mediciones)
- Fase 5: M7 Informes médicos (borrador, firma, visualización)
- Fase 6: QA y accesibilidad (ambos temas)

## 3. Tareas por fase (con criterios)
Cada tarea: ID, descripción, archivos, criterio de done, dependencias.

Fase 0:
- T0.1 Inicializar proyecto con Vite + React y tooling (lint, format). Done: `npm run dev` arranca y `npm run build` termina sin errores.
- T0.2 Tailwind + tokens CSS de 2.1 y 2.6 (archivo de tokens + mapeo en la config de Tailwind). Done: cambiar `data-theme` cambia todos los colores sin tocar componentes.
- T0.3 Supabase: proyecto, migraciones del esquema base (`profiles`, `patients`, `appointments`, `staff`, `studies`, `measurements`, `reports`) y políticas RLS por rol. Done: dos usuarios de prueba (admin y médico) ven exactamente lo que permite la matriz de permisos.
- T0.4 Bootstrap de tema pre-paint (`index.html`): lee `localStorage`, si no hay valor usa `prefers-color-scheme`, aplica `data-theme` antes del primer paint. Done: recargar no muestra destello del tema contrario. Depende de T0.2.

Fase 1:
- T1.1 Componentes base (Button, Input, Select, Textarea, Checkbox, Switch, Card, Table, Modal/Drawer, Tabs, Toast, EmptyState, Skeleton). Done: componentes reutilizables, todos con colores por token y foco visible.
- T1.2 Iconos (set único, Lucide o Heroicons outline, 16/20/24). Done: un solo set en todo el proyecto.
- T1.3 ThemeToggle (Switch con etiqueta textual claro/oscuro). Done: alterna `data-theme`, persiste en `localStorage`, accesible por teclado. Depende de T0.4.

Fase 2:
- T2.1 Sidebar colapsable + routing, con items filtrados por rol. Done: navegación funcional, sin navbar horizontal; items sin permiso no se renderizan.
- T2.2 Header de contenido con título + acciones contextuales + ThemeToggle. Done: título y toggle presentes en todas las rutas autenticadas.

Fase 3:
- T3.1 Auth (login, recuperación, logout, carga de perfil y rol). Done: flujo F1 completo; rutas protegidas por rol.
- T3.2 Dashboard. Done: resumen del día con accesos rápidos según rol.
- T3.3 Pacientes (listado paginado, ficha, CRUD). Done: gestión de pacientes funcional; la ficha muestra citas, estudios e informes.
- T3.4 Citas (calendario/listado, CRUD, estados). Done: flujos F2/F3 completos.
- T3.5 Personal médico (listado, ficha, especialidad). Done: flujo F4 completo, solo admin.

Fase 4 (M6 Visor DICOM):
- T4.1 Aprobar e instalar la librería DICOM. Done: dependencia aprobada por el usuario y fijada en el lockfile. **Bloqueante para el resto de la fase.**
- T4.2 Carga de estudios: `.dcm` sueltos o ZIP de serie → bucket privado de Storage + metadatos (modalidad, fecha, cortes, dimensiones, `PixelSpacing`). Done: un archivo de prueba aparece asociado al paciente con sus metadatos; archivo no DICOM devuelve error claro.
- T4.3 Visor: zoom, pan, ventana/nivel (presets + manual), navegación de cortes, reset, viewport oscuro fijo (especificaciones 2.6/T6). Done: imagen visible y navegable; sin errores en consola.
- T4.4 Mediciones básicas: distancia, ángulo, ROI elíptica/rectangular (área y media), calibradas con `PixelSpacing`; sin calibración se etiqueta "sin calibración". Done: la distancia de un objeto conocido es coherente con el espaciado del píxel.
- T4.5 Persistencia de mediciones y permisos: guardar/quitar mediciones por estudio; admin solo lectura. Done: mediciones sobreviven a recargar y respetan RLS. Depende de T4.4.

Fase 5 (M7 Informes):
- T5.1 Modelo y editor de informe en borrador (paciente, motivo, hallazgos, conclusión, recomendaciones, estudio opcional). Done: guardar y reabrir un borrador conserva todos los campos.
- T5.2 Firma: transición borrador → firmado, inmutable; corrección por adenda referenciada. Done: un informe firmado no admite edición ni por API (RLS/trigger), y la adenda queda vinculada.
- T5.3 Vista de solo lectura + impresión del navegador. Done: el informe firmado se muestra completo con paciente, autor, fecha y estudio.
- T5.4 Listado por paciente y por fecha, filtros por estado con chips (sin buscador global). Done: los filtros funcionan y no existe input de búsqueda.
- T5.5 Vinculación estudio ↔ informe: el borrador consume las mediciones guardadas en M6. Done: flujo F6 completo de extremo a extremo. Depende de T4.5 y T5.1.

Fase 6:
- T6.1 Accesibilidad: contraste y foco en claro y oscuro, axe y Lighthouse sin fallos AA. Done: C8 y C11 verificados en ambos temas.
- T6.2 QA end-to-end de F1-F7. Done: sin errores en consola, criterios C1-C12 repasados.
- T6.3 Regresión de tema y build: `npm run build` limpio; ninguna superficie fuera de tokens salvo el viewport DICOM. Done: C10 y C11(d) verificados.

## 4. Orden y dependencias
- Fase 0 → Fase 1 → Fase 2 → Fase 3.
- En Fase 3: Auth primero; Dashboard, Pacientes, Citas y Personal en paralelo tras Auth.
- Fase 4 depende de T0.3 (Storage/RLS) y de T4.1 (aprobación de la librería).
- Fase 5 depende de Fase 4 solo para T5.5; T5.1-T5.4 pueden desarrollarse en paralelo a Fase 4.
- Fase 6 va al final, con ambos temas ya implementados.
- La aprobación de la dependencia DICOM (T4.1) es el único bloqueo externo del plan.

## 5. Verificación
- Comandos: `npm run dev` (arranque), `npm run build` (build), `npm run lint` (lint). Comando de tests solo si el proyecto los define.
- Checklist manual por flujo F1-F7 contra criterios C1-C12 de las especificaciones.
- Tema: comprobar con `localStorage` limpio (sigue el sistema) y con valor fijado (se mantiene tras recarga), sin destello en el primer paint.
- DICOM: usar un `.dcm` de muestra con `PixelSpacing` conocido y otro sin él.
- RLS: probar con una sesión admin y otra médico; no basta con ocultar botones.

## 6. Riesgos
- Riesgo principal: sobrecarga de alcance. Mitigación: ceñirse estrictamente a M1-M7; lo que no esté en la sección 6 espera.
- Riesgo de DICOM: la librería añade peso y complejidad, y puede no cubrir el render esperado. Mitigación: T4.1 valida la librería con un archivo real antes de construir el visor; si no cumple, se replantea con el usuario.
- Riesgo de tema: colores literales que rompen el oscuro. Mitigación: regla T3 de la sección 2.6 y criterio C11(d) en cada PR.
- Riesgo de seguridad: RLS mal configurada expone datos clínicos. Mitigación: T0.3 y T5.2 se verifican con sesiones de rol distinto, no solo en UI.
- Riesgo visual: introducir navbar/buscador genéricos. Mitigación: rechazar por checklist C3-C4.
- Riesgo de consistencia visual: validar contra C1-C6 en cada componente nuevo.
