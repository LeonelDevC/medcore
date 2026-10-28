# Hospital · MVP Clínico

Sistema de gestión hospitalaria web minimalista basado en el estándar SSDD (`spect/especificaciones-ssd.md`).

## Módulos del MVP (M1–M7)
- **M1 Autenticación:** Login, recuperación y logout con roles `admin` y `medico`.
- **M2 Dashboard:** Resumen diario y accesos rápidos según rol.
- **M3 Pacientes:** Listado paginado, ficha clínica (citas, notas, estudios, informes).
- **M4 Citas:** Agenda y calendario, estados programada/realizada/cancelada.
- **M5 Personal médico:** Gestión de facultativos y especialidades (solo admin).
- **M6 Visor DICOM:** Carga local de archivos `.dcm`/ZIP, ventana/nivel y mediciones calibradas.
- **M7 Informes médicos:** Ciclo borrador → firmado inmutable, corrección mediante adendas.

## Principios y Diseño
- Minimalismo clínico: paleta azul claro en tokens CSS (`--primary`, `--bg`, `--surface`).
- Soporte completo de tema claro y oscuro sin destello pre-paint (`data-theme`).
- Navegación exclusiva mediante sidebar colapsable (sin navbars horizontales genéricos ni buscador global).
- Cumplimiento de accesibilidad WCAG 2.1 AA.

## Estructura del Proyecto
- `frontend/`: Aplicación React + TypeScript + Vite + SASS modular.
- `backend/`: API en Go con arquitectura modular.
- `spect/`: Especificaciones SSDD y plan de desarrollo.
