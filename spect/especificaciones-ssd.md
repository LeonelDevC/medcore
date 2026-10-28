# Especificaciones SSDD — MVP Hospitalario

## 0. Propósito y alcance

SSDD (Single Source of Design & Development) en este proyecto: un único documento de especificaciones que es la fuente de verdad para el diseño y desarrollo del MVP. De él deriva `plan.md`. Toda decisión de UI/UX, tokens, componentes y módulos se valida contra este documento.

Alcance: MVP hospitalario (web). No incluye integración con sistemas externos (HIS, PACS, etc.) ni cumplimiento normativo completo (HIPAA/GDPR) — ver sección 9. El visor DICOM (M6) trabaja sobre archivos/estudios cargados manualmente por el usuario, no sobre un PACS.

## 1. Visión y principios de diseño

Principios (orden de prioridad):
1. Claridad clínica: la información médica debe ser legible y sin ruido.
2. Minimalismo: solo lo necesario. El espacio en blanco es un elemento de diseño.
3. Consistencia: mismos patrones en todos los módulos.
4. Accesibilidad: WCAG 2.1 AA básico — contraste AA mínimo, foco visible, navegación por teclado.

Reglas visuales derivadas de los requisitos del usuario:
- R1 Minimalista: sin decoración superflua, sin gradientes complejos, sin sombras pesadas (solo sombra sutil 0-1px), sin iconos decorativos sin función.
- R2 Tonos azul claro: paleta basada en azules claros; el azul es el único color de marca. Estados (éxito/error/aviso) usan color semántico para texto/icono y su variante "bg" desaturada solo como fondo de superficies pequeñas; nunca como fondo de sección.
- R3 Sin navbar genérico: no se usa barra horizontal estándar logo+links+CTA. Navegación mediante sidebar colapsable (icono + etiqueta) o navegación contextual por módulo.
- R4 Sin buscador propio: no hay campo de búsqueda global. Filtrado contextual por sección (chips/filtros) y uso de búsqueda nativa del navegador cuando aplique.
- R5 Sin palabras pequeñas con puntos de color: no usar badges/chips con punto de color y texto <12px. Estados se expresan con texto + color semántico o icono, tamaño mínimo 12px.
- R6 Sin márgenes de color con background que rompa el tono: no se usan secciones con fondo de color distinto al fondo base. Separación por espacio y líneas sutiles, no por bloques de color. Excepción documentada: el viewport del visor DICOM (M6) usa fondo neutro oscuro por contraste diagnóstico (ver 2.6).
- R7 Tema claro y oscuro desde el inicio: ambos temas derivan del mismo conjunto de tokens (2.6). Ningún componente usa color hexadecimal literal; todo color sale de una variable de tema.

## 2. Tokens de diseño

### 2.1 Color (azul claro)
- --bg: #F7FAFC (fondo base)
- --surface: #FFFFFF
- --surface-2: #F0F6FB
- --border: #DCE6F1
- --text: #1F2937
- --text-muted: #6B7280
- --primary: #1D4ED8
- --primary-soft: #DBEAFE
- --primary-hover: #1E40AF
- --on-primary: #FFFFFF (texto sobre superficie --primary)
- --success: #047857
- --warning: #B45309
- --danger: #B91C1C
- --info: #1D4ED8
- Fondos desaturados de estado (solo superficies pequeñas): --success-bg #D1FAE5, --warning-bg #FEF3C7, --danger-bg #FEE2E2, --info-bg #DBEAFE

Nota: los valores de esta sección están calculados para cumplir AA (texto normal ≥ 4.5:1) sobre --bg, --surface y su propio fondo desaturado. No se cambian "a ojo": cualquier ajuste se revalida con C8.

Regla: fondos de sección siempre --bg o --surface. Nunca --primary-soft como fondo de bloque grande. Los colores de estado son para texto, icono y borde; su variante --*-bg solo se usa en superficies pequeñas (toast, fila de error) y siempre con el texto de estado encima.

### 2.2 Tipografía
- Familia: Inter (o system-ui fallback)
- Escala: 12, 14, 16, 20, 24, 32
- Pesos: 400, 500, 600
- Line-height: 1.5 cuerpo, 1.2 títulos
- Mínimo de texto: 12px (R5)

### 2.3 Espaciado
- Base 4px. Escala: 4, 8, 12, 16, 24, 32, 48, 64
- Padding de tarjeta: 16-24
- Gap entre secciones: 24-32

### 2.4 Radios y sombras
- Radio: 6px (inputs/botones), 8px (tarjetas), 12px (modales)
- Sombra: 0 1px 2px máximo, con el token --shadow (2.6). Sin sombras grandes.

### 2.5 Iconos
- Set único (Lucide o Heroicons outline). Tamaño 16/20/24. Sin iconos decorativos.

### 2.6 Tema claro / oscuro
Ambos temas son obligatorios desde el MVP. Un único conjunto de nombres de token; el tema se resuelve con el atributo `data-theme="light|dark"` en `<html>` (o `.dark` con la estrategia `class` de Tailwind).

Tokens por tema (mismo nombre, distinto valor):

| Token | Claro | Oscuro |
|---|---|---|
| --bg | #F7FAFC | #0B1220 |
| --surface | #FFFFFF | #111A2B |
| --surface-2 | #F0F6FB | #16223A |
| --border | #DCE6F1 | #22304A |
| --text | #1F2937 | #E5EDF7 |
| --text-muted | #6B7280 | #94A3B8 |
| --primary | #1D4ED8 | #60A5FA |
| --primary-soft | #DBEAFE | #1B3358 |
| --primary-hover | #1E40AF | #93C5FD |
| --on-primary | #FFFFFF | #0B1220 |
| --success | #047857 | #34D399 |
| --warning | #B45309 | #FBBF24 |
| --danger | #B91C1C | #F87171 |
| --info | #1D4ED8 | #60A5FA |
| --success-bg | #D1FAE5 | #10362B |
| --warning-bg | #FEF3C7 | #3A2A0B |
| --danger-bg | #FEE2E2 | #3B1418 |
| --info-bg | #DBEAFE | #1B3358 |
| --shadow | 0 1px 2px rgba(0,0,0,0.05) | 0 1px 2px rgba(0,0,0,0.40) |

Reglas del tema:
- T1 Selección: en el primer acceso se respeta `prefers-color-scheme`; el usuario puede fijar el tema desde el header de contenido (componente ThemeToggle) y la elección persiste en `localStorage`.
- T2 Sin flash: el tema se aplica con un script inline en `index.html` antes del primer paint. Recargar nunca muestra el tema contrario.
- T3 Cero colores literales en componentes: todo color referencia un token. Solo los tokens de 2.6 contienen valores hexadecimales.
- T4 Contraste en ambos temas: texto normal ≥ 4.5:1; texto grande y componentes de UI ≥ 3:1 (WCAG 2.1 AA).
- T5 Botones rellenos: en oscuro `--primary` se aclara y `--on-primary` pasa a oscuro, de forma que el texto del botón mantiene el contraste AA en ambos temas.
- T6 Viewport DICOM: fondo neutro oscuro fijo (#000000 en ambos temas) con imagen y overlays en tonos claros. Es la única superficie que no sigue `--surface`, por contraste diagnóstico (excepción a R6). La barra de herramientas del visor sí usa tokens del tema.

## 3. Layout y navegación

- Estructura: sidebar izquierda (colapsable, 64px colapsada / 240px expandida) + área de contenido principal.
- Sidebar: fondo --surface, borde derecho --border, items con icono + etiqueta (etiqueta oculta al colapsar con tooltip). Item activo: fondo --primary-soft, texto --primary, sin borde lateral de color (R6).
- Items por rol: admin ve Dashboard, Pacientes, Citas, Personal, Informes. Médico ve Dashboard, Pacientes, Citas, Estudios (DICOM), Informes. Los items sin permiso no se renderizan (no se deshabilitan).
- Header de contenido: título de página (24px) + acciones contextuales a la derecha. El ThemeToggle forma parte de esas acciones y está presente en todas las rutas autenticadas. Sin logo repetido, sin buscador.
- Sin navbar horizontal.
- Responsive: en móvil, sidebar se convierte en drawer (hamburguesa) — único uso de icono hamburguesa.

## 4. Componentes

### 4.1 Permitidos
- Botón (primary, secondary, ghost, danger) — alturas 32/40
- Input, Select, Textarea, Checkbox, Radio, Switch
- Tarjeta (card) con borde sutil
- Tabla simple (sin zebra pesada; hover sutil)
- Modal / Drawer
- Tabs (sub-navegación dentro de módulo)
- Toast (notificaciones)
- Empty state (icono + texto + CTA)
- Skeleton loader
- ThemeToggle (Switch claro/oscuro con etiqueta textual, no solo icono)

### 4.2 Prohibidos
- Navbar horizontal genérico
- Search bar global
- Badges con punto de color y texto <12px
- Secciones con fondo de color que rompa el tono (salvo el viewport DICOM, 2.6/T6)
- Colores hexadecimales o rgb() literales en componentes (deben venir de tokens, R7)
- Carousels, accordions anidados, tooltips excesivos
- Gradientes, glassmorphism

## 5. Reglas de contenido y microcopy

- Idioma: español (es-ES) por defecto; preparar i18n.
- Tono: claro, directo, sin jerga innecesaria.
- Estados: texto + color semántico; evitar "punto de color" solo.
- Fechas/horas: formato ISO en datos, presentación dd/mm/yyyy HH:mm.
- Números: separador de miles con espacio, decimal con coma.

## 6. Módulos del MVP (alcance mínimo)

Roles del MVP: **admin** y **médico**, únicamente. No existen enfermería ni recepción.

M1 Autenticación: login (email+password), recuperación de contraseña, logout. Roles: admin, médico. El rol viaja en el perfil del usuario (tabla `profiles`/claim) y se aplica con RLS en Supabase.
M2 Dashboard: resumen del día (citas, ingresos, ocupación de camas), accesos rápidos según rol.
M3 Pacientes: listado paginado, ficha de paciente (datos personales, historial de citas, notas, estudios e informes), crear/editar.
M4 Citas: calendario/listado, crear cita (paciente, médico, fecha, motivo), estados (programada, realizada, cancelada).
M5 Personal médico: listado, ficha, asignación de especialidad. Solo admin.
M6 Visor DICOM: carga y visualización de estudios DICOM locales (no PACS) y mediciones básicas.
  - Carga: uno o varios `.dcm` o un ZIP de serie; se sube a Supabase Storage y se guardan metadatos mínimos (modalidad, fecha de estudio, número de cortes, dimensiones, `PixelSpacing` si existe).
  - Visor: zoom, pan, ajuste de ventana/nivel (presets + manual), navegación de cortes/serie, reset de vista. Sin reconstrucción 3D ni MPR.
  - Mediciones: distancia (mm con `PixelSpacing`), ángulo, ROI elíptica/rectangular con área y media. Si el archivo no trae `PixelSpacing`, la medida se muestra en px con la etiqueta "sin calibración".
  - Persistencia: las mediciones se guardan asociadas al estudio y quedan disponibles en el borrador del informe (M7).
  - Permisos: médico carga estudios y crea mediciones; admin visualiza metadatos y estudios, no edita mediciones.
M7 Informes médicos: crear y visualizar informes.
  - Crear: paciente, estudio DICOM vinculado (opcional), motivo, hallazgos, conclusión, recomendaciones. Autor y fecha se registran automáticamente.
  - Estados: borrador (editable) y firmado (inmutable; una corrección se hace con una adenda que referencia el informe firmado).
  - Visualizar: vista de solo lectura con datos del paciente, autor, fecha y estudio asociado. Impresión mediante la función de impresión del navegador (sin exportación a PDF propia).
  - Listado por paciente y por fecha, con filtros por estado mediante chips (sin buscador global).

Matriz de permisos:

| Capacidad | admin | médico |
|---|---|---|
| Gestionar personal médico | Sí | No |
| Gestionar pacientes y citas | Sí | Sí (pacientes y agenda propios) |
| Cargar estudios DICOM | No | Sí |
| Crear/editar mediciones | No | Sí |
| Crear/firmar informes | No | Sí (propios) |
| Ver informes | Todos | Propios y de sus pacientes |

Fuera de alcance MVP: facturación, farmacia, laboratorio, historial clínico detallado (EHR), integración externa, reconstrucción 3D/MPR, firma digital certificada.

## 7. Flujos de usuario clave

F1 Login → Dashboard
F2 Admin registra paciente → crea cita
F3 Médico consulta agenda del día → abre ficha de paciente → añade nota
F4 Admin gestiona personal médico
F5 Médico abre estudio DICOM desde la ficha del paciente → ajusta ventana/nivel → mide una distancia → guarda el estudio con mediciones
F6 Médico crea un informe para el estudio → lo firma → lo visualiza en solo lectura; admin lo consulta desde la ficha del paciente
F7 Cambio de tema: el usuario alterna claro/oscuro en el header → recarga la página → el tema elegido se mantiene sin destello

## 8. Criterios de aceptación verificables

C1 Minimalismo: en cada pantalla, número de colores distintos ≤ 4 (incluyendo semánticos) y sin gradientes. Verificar por inspección visual + captura.
C2 Paleta azul claro: todos los fondos de sección son --bg o --surface (excepción: viewport DICOM, T6); el único color de marca es --primary. Verificar con DevTools (computed styles).
C3 Sin navbar genérico: no existe elemento nav horizontal con logo+links+CTA en ninguna ruta. Verificar por snapshot DOM.
C4 Sin buscador propio: no existe input type="search" global ni componente SearchBar en layout principal. Verificar por grep en código.
C5 Sin palabras pequeñas con puntos de color: ningún texto <12px acompañado de indicador de color (dot/badge). Verificar por inspección + regla CSS (font-size >= 12px para elementos con color semántico).
C6 Sin márgenes de color que rompan tono: ninguna sección tiene background distinto a --bg/--surface/--surface-2 (excepción única: viewport DICOM, T6). Verificar por inspección.
C7 Navegación por sidebar: sidebar presente en todas las rutas autenticadas, colapsable, con estado activo visible. Verificar por interacción manual.
C8 Accesibilidad: contraste texto normal/fondo ≥ 4.5:1 y texto grande/componentes de UI ≥ 3:1 (AA), en tema claro y oscuro; foco visible en todos los interactivos; navegación completa por teclado. Verificar con axe y Lighthouse en ambas rutas de tema.
C9 MVP funcional: flujos F1-F7 completos sin errores en consola. Verificar por prueba manual end-to-end.
C10 No-regresión: la app arranca (dev server), `npm run build` termina sin errores y las rutas principales cargan sin error. Verificar: abrir URL, navegar módulos, sin errores en consola.
C11 Tema claro/oscuro: existe ThemeToggle en el header de todas las rutas autenticadas; (a) en primer acceso el tema coincide con `prefers-color-scheme`; (b) al alternar y recargar se mantiene el tema elegido; (c) no hay destello del tema contrario en la primera pintura (grabación de pantalla lenta o captura en el primer frame); (d) ninguna superficie de sección usa color fuera de tokens en ninguno de los dos temas (inspección con DevTools sobre `data-theme`). Verificar: los cuatro puntos, con `localStorage` limpio y con valor fijado.
C12 DICOM e informes: subir un `.dcm` de prueba muestra la imagen en el viewport oscuro; la herramienta de distancia devuelve un valor en mm coherente con `PixelSpacing` (o la etiqueta "sin calibración" si falta); el informe creado pasa de borrador a firmado, y firmado ya no admite edición. Verificar con un archivo DICOM de muestra y una prueba manual del ciclo borrador → firmado → solo lectura.

## 9. Fuera de alcance

- Integración con HIS/PACS/RIS (el DICOM de M6 es carga manual de archivos)
- Cumplimiento normativo completo (HIPAA/GDPR) — solo buenas prácticas básicas
- Facturación, farmacia, laboratorio, EHR detallado
- DICOM avanzado: reconstrucción 3D, MPR, segmentación automática, IA diagnóstica
- Firma digital certificada y sellado de tiempo de informes
- Roles distintos de admin y médico
- App móvil nativa (solo web responsive)
- Multi-idioma completo (solo es-ES en MVP)

## 10. Decisiones y supuestos

Preguntas abiertas resueltas (Q1-Q5):

- D1 (Q1) Stack: **React + Vite + Tailwind CSS + Supabase**. Supabase cubre auth, base de datos (Postgres + RLS) y storage para los archivos DICOM. Sin backend propio en el MVP.
- D2 (Q2) Identidad: **marca blanca/genérica**. No hay logo ni colores corporativos; la paleta de este documento es la identidad del producto.
- D3 (Q3) Alcance funcional: **M1-M7**, con M6 Visor DICOM y M7 Informes médicos añadidos. Roles reducidos a **admin y médico**.
- D4 (Q4) Tema: **claro y oscuro desde el inicio**, ambos obligatorios en el MVP (2.6, C11).
- D5 (Q5) Accesibilidad: **WCAG 2.1 AA básico** (C8, C11), verificado con axe/Lighthouse.

Supuestos vigentes:
- S1 Responsive: móvil secundario, tablet prioritario para uso clínico; el visor DICOM se diseña para escritorio/tablet y en móvil muestra un aviso de pantalla pequeña.
- S2 Datos: esquema en Supabase con RLS por rol desde el primer módulo; datos de prueba sembrados por migración.
- S3 Librería DICOM: el visor requiere una librería de parseo/render (p. ej. cornerstone3D o dicom-parser). Es una dependencia nueva y queda **pendiente de aprobación del usuario** antes de instalar; no se añade por iniciativa propia.
- S4 Idiomas: es-ES en el MVP, textos centralizados para facilitar i18n posterior.

## 11. Relación con plan.md

`plan.md` deriva de este documento. Ver plan.md para fases, tareas, dependencias y verificación.
