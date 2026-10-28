import { test, expect } from '@playwright/test'

test.describe('F1 — Login y Rutas Base', () => {
  test('Ruta /login carga limpiamente y sin errores de consola', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    page.on('pageerror', (err) => {
      consoleErrors.push(err.message)
    })

    await page.goto('/login')

    // Título de la página
    await expect(page).toHaveTitle(/Hospital · Gestión clínica/)

    // Card de login con estado inicial
    const heading = page.getByRole('heading', { name: 'Iniciar sesión' })
    await expect(heading).toBeVisible()

    // No debe haber navbar horizontal genérico ni buscador en login
    await expect(page.locator('header nav')).toHaveCount(0)
    await expect(page.locator('input[type="search"]')).toHaveCount(0)

    // Cero errores de consola
    expect(consoleErrors).toEqual([])
  })
})
