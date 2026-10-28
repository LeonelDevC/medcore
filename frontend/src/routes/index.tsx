import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '../layouts/AppLayout/AppLayout'
import { AuthLayout } from '../layouts/AuthLayout/AuthLayout'
import { CitasPage } from '../pages/CitasPage/CitasPage'
import { DashboardPage } from '../pages/DashboardPage/DashboardPage'
import { DicomPage } from '../pages/DicomPage/DicomPage'
import { InformesPage } from '../pages/InformesPage/InformesPage'
import { LoginPage } from '../pages/LoginPage/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage/NotFoundPage'
import { PacientesPage } from '../pages/PacientesPage/PacientesPage'
import { PersonalPage } from '../pages/PersonalPage/PersonalPage'

/**
 * Rutas del MVP. La estructura por rol ya está definida en `nav.ts`; la
 * protección de rutas por sesión y rol llega con Auth (T3.1), respaldada por
 * el API Go (el frontend no decide permisos).
 */
export const router = createBrowserRouter([
  {
    path: '/login',
    element: <AuthLayout />,
    children: [{ index: true, element: <LoginPage /> }],
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'pacientes', element: <PacientesPage /> },
      { path: 'citas', element: <CitasPage /> },
      { path: 'personal', element: <PersonalPage /> },
      { path: 'estudios', element: <DicomPage /> },
      { path: 'informes', element: <InformesPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
