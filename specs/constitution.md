# Constitución del Sistema — MVP Hospitalario

> **Estatus:** Ley Suprema del Repositorio (Inmutable salvo consenso explícito del usuario)  
> **Ámbito:** Toda arquitectura, especificación técnica, diseño visual y código del sistema hospitalario.

---

## Preámbulo

Esta Constitución establece las reglas fundacionales, directrices de diseño y salvaguardas arquitectónicas que rigen el desarrollo del Sistema Hospitalario. Ninguna especificación técnica, plan de implementación ni fragmento de código puede entrar en conflicto con los principios aquí consagrados.

Cualquier cambio propuesto que contravenga esta Constitución se considerará **nulo por definición**.

---

## Artículo I — Principios Rectores y Claridad Clínica

1. **Claridad Clínica Suprema:** La información médica debe presentarse sin distracciones, ruido visual ni ambigüedad diagnóstica.
2. **Minimalismo Estricto:** Cada elemento visual en pantalla debe cumplir una función clínica explícita. El espacio en blanco es un elemento de diseño funcional, no un vacío que deba llenarse.
3. **Consistencia Integral:** Todos los módulos del sistema deben compartir los mismos patrones de interacción, retroalimentación y nomenclatura.
4. **Accesibilidad Obligatoria:** Cumplimiento total del estándar **WCAG 2.1 AA**:
   - Contraste de texto normal $\ge 4.5:1$.
   - Contraste de texto grande y componentes interactivos $\ge 3:1$.
   - Foco visible inequívoco en todos los elementos interactivos.
   - Navegación integral por teclado sin trampas de foco.

---

## Artículo II — Reglas Visuales Inviolables (Criterios C1–C6)

Las siguientes reglas visuales no admiten excepción alguna:

1. **R1 — Minimalismo Estricto:**
   - Prohibido el uso de gradientes, efectos de *glassmorphism*, fondos translúcidos o iconos puramente decorativos.
   - La sombra máxima permitida en cualquier tarjeta o elevación es `0 1px 2px` (`--shadow`).
2. **R2 — Paleta Azul Claro Exclusiva:**
   - El azul claro es el **único color de marca**.
   - Los estados del sistema (éxito, aviso, peligro/error) utilizan exclusivamente sus respectivos colores semánticos en texto, iconos y bordes. Las variantes `--*-bg` desaturadas solo pueden emplearse en superficies pequeñas (toasts, alertas de una línea), jamás como fondos de sección.
3. **R3 — Prohibición de Navbar Genérico:**
   - Queda terminantemente prohibido utilizar barras de navegación horizontales con el patrón logo + enlaces + CTA.
   - La navegación principal se efectúa exclusivamente mediante un **Sidebar colapsable** (icono + etiqueta) o navegación contextual de módulo.
4. **R4 — Prohibición de Buscador Global:**
   - No existe campo de búsqueda global en la cabecera.
   - El filtrado se realiza exclusivamente de forma **contextual por sección** mediante chips/filtros específicos.
5. **R5 — Prohibición de Badges con Puntos de Color Pequeños:**
   - Prohibido el patrón de punto de color (*dot*) con texto de tamaño menor a $12\text{ px}$.
   - Los estados clínicos y del sistema deben expresarse mediante texto explícito $\ge 12\text{ px}$ acompañado de icono o color semántico.
6. **R6 — Fondo Uniforme y Continuidad Tonal:**
   - Los fondos de pantalla y sección son siempre `--bg` o `--surface`.
   - La jerarquía y separación se delimitan mediante espacio en blanco y bordes sutiles (`--border`), nunca mediante bloques de colores contrastantes.
   - *Única excepción formal:* El *viewport* de renderizado del visor DICOM (M6), que utiliza fondo neutro oscuro (`#000000` / `#0B1220`) por requerimiento de contraste radiológico.
7. **R7 — Cero Colores Literales y Dualidad Claro/Oscuro:**
   - Ningún componente puede declarar colores en hexadecimal (`#...`) o `rgb()` fuera del archivo oficial de tokens (`tokens.sass` / `tokens.css`).
   - El soporte para **tema claro y oscuro es obligatorio desde el MVP**.
   - No se permite destello de color (*flash*) en el primer render: la inicialización se resuelve pre-paint en `index.html`.

---

## Artículo III — Seguridad, Roles y Permisos (DB-Enforced)

1. **Modelo de Dos Roles Únicos:**
   - El sistema reconoce exclusivamente dos roles: `admin` y `medico`. No existen roles de enfermería, recepción ni auxiliares en el MVP.
2. **Seguridad en la Capa de Datos:**
   - La interfaz oculta las acciones no permitidas, pero **la base de datos y la API las impiden de forma inquebrantable** mediante Row Level Security (RLS) y validación estricta de tokens en backend.
   - Un usuario con rol `medico` no puede consultar ni modificar personal médico.
   - Un usuario con rol `admin` no puede cargar estudios DICOM, crear mediciones clínicas ni redactar informes médicos.
3. **Invisibilidad de Opciones sin Permiso:**
   - Los elementos de navegación y acciones restringidas **no se renderizan** en la interfaz si el usuario carece de permiso. No se muestran deshabilitados.

---

## Artículo IV — Alcance Funcional del MVP (Módulos M1–M7)

El MVP comprende exclusivamente los módulos:
- **M1:** Autenticación y Perfil (roles `admin` y `medico`).
- **M2:** Dashboard clínico adaptado al rol.
- **M3:** Gestión de Pacientes y Ficha Clínica.
- **M4:** Gestión de Citas y Agenda (estados finales inmutables: `realizada`, `cancelada`).
- **M5:** Gestión de Personal Médico (exclusivo para `admin`).
- **M6:** Visor DICOM (carga manual `.dcm`/ZIP, ventana/nivel, mediciones calibradas en mm).
- **M7:** Informes Médicos (ciclo: borrador editable $\to$ firmado inmutable $\to$ adendas referenciadas).

*Fuera de Alcance Absoluto:* Facturación, farmacia, laboratorio, integración HIS/PACS, reconstrucción 3D/MPR, firma digital criptográfica externa, aplicaciones móviles nativas y soporte multi-idioma (solo `es-ES`).

---

## Artículo V — Metodología de Ingeniería: SDD + ODD

El desarrollo del proyecto adopta el principio de **Organic-Driven Development (ODD)** sobre la base de **Spec-Driven Development (SDD)**:

1. **Nivel 1 (Micro / Bajo Riesgo):** Correcciones menores de interfaz, ajustes de copy y correcciones atómicas se ejecutan directamente en código (*Zero Ceremony*), validando compilación limpia y linters.
2. **Nivel 2 (Feature / Riesgo Medio):** Mejoras de componentes o nuevas pantallas requieren una especificación técnica concisa en `specs/features/`.
3. **Nivel 3 (Core / Arquitectura / Crítico):** Cambios en base de datos, seguridad, RLS, DICOM (M6) o Informes (M7) exigen el ciclo SDD completo:
   - Redacción formal de la especificación técnica.
   - Auditoría y prueba de estrés multi-perspectiva (arquitectura, seguridad, accesibilidad).
   - Aprobación explícita antes de iniciar la implementación.
