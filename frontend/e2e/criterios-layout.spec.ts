import { test, expect } from '@playwright/test'

test.describe('Criterios de Layout y Navegación (C1–C10)', () => {
  test('C3 & C4: Sin navbar horizontal genérico y sin buscador global', async ({ page }) => {
    await page.goto('/dashboard')

    // C3: No debe existir un navbar horizontal estándar con logo + links + CTA
    await expect(page.locator('.header nav, header.navbar, .navbar')).toHaveCount(0)

    // C4: No debe existir un input de búsqueda global en el layout
    await expect(page.locator('input[type="search"], input[placeholder*="Buscar"]')).toHaveCount(0)
  })

  test('C7: Sidebar colapsable y navegación funcional según rol (admin)', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    page.on('pageerror', (err) => {
      consoleErrors.push(err.message)
    })

    await page.goto('/dashboard')

    // Sidebar existe
    const sidebar = page.locator('aside.sidebar')
    await expect(sidebar).toBeVisible()

    // Botón para colapsar/expandir sidebar
    const collapseButton = page.getByRole('button', { name: /Colapsar menú lateral/i })
    await expect(collapseButton).toBeVisible()

    // Colapsar
    await collapseButton.click()
    await expect(sidebar).toHaveClass(/sidebar--collapsed/)

    // Expandir de nuevo
    const expandButton = page.getByRole('button', { name: /Expandir menú lateral/i })
    await expandButton.click()
    await expect(sidebar).not.toHaveClass(/sidebar--collapsed/)

    // Rol admin por defecto en Fase 0:
    // Visible: Dashboard, Pacientes, Citas, Personal, Informes
    // Oculto (sin permiso): Estudios (solo médico)
    await expect(page.getByRole('link', { name: 'Estudios', exact: true })).toHaveCount(0)

    const adminRoutes = [
      { name: 'Pacientes', path: '/pacientes' },
      { name: 'Citas', path: '/citas' },
      { name: 'Personal', path: '/personal' },
      { name: 'Informes', path: '/informes' },
      { name: 'Dashboard', path: '/dashboard' },
    ]

    for (const r of adminRoutes) {
      const link = page.getByRole('link', { name: r.name, exact: true })
      await link.click()
      await expect(page).toHaveURL(new RegExp(r.path))
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    }

    // Cero errores de consola en toda la navegación (C10)
    expect(consoleErrors).toEqual([])
  })
})
