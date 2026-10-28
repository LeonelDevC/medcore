import {
  BriefcaseMedical,
  CalendarDays,
  FileText,
  LayoutDashboard,
  ScanLine,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { Role } from '../types'

export type NavItem = {
  to: string
  label: string
  description: string
  icon: LucideIcon
  roles: Role[]
}

/**
 * Navegación del MVP (§3). Los items sin permiso NO se renderizan; no se
 * deshabilitan. admin: dashboard, pacientes, citas, personal, informes.
 * médico: dashboard, pacientes, citas, estudios (DICOM), informes.
 */
export const NAV_ITEMS: NavItem[] = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    description: 'Resumen del día y accesos rápidos',
    icon: LayoutDashboard,
    roles: ['admin', 'medico'],
  },
  {
    to: '/pacientes',
    label: 'Pacientes',
    description: 'Listado, ficha e historial',
    icon: Users,
    roles: ['admin', 'medico'],
  },
  {
    to: '/citas',
    label: 'Citas',
    description: 'Agenda y programación',
    icon: CalendarDays,
    roles: ['admin', 'medico'],
  },
  {
    to: '/personal',
    label: 'Personal',
    description: 'Personal médico y especialidades',
    icon: BriefcaseMedical,
    roles: ['admin'],
  },
  {
    to: '/estudios',
    label: 'Estudios',
    description: 'Estudios DICOM y mediciones',
    icon: ScanLine,
    roles: ['medico'],
  },
  {
    to: '/informes',
    label: 'Informes',
    description: 'Borradores y informes firmados',
    icon: FileText,
    roles: ['admin', 'medico'],
  },
]

/** Items visibles para un rol. Sin rol no se muestra navegación. */
export function navItemsForRole(role: Role | null): NavItem[] {
  if (!role) return []
  return NAV_ITEMS.filter((item) => item.roles.includes(role))
}

/** Item correspondiente a la ruta actual (sirve para el título del header). */
export function findNavItem(pathname: string): NavItem | undefined {
  return NAV_ITEMS.find(
    (item) => pathname === item.to || pathname.startsWith(`${item.to}/`),
  )
}
