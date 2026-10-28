import { test, expect } from '@playwright/test'

test.describe('F7 — Cambio de tema (C11)', () => {
  test('ThemeToggle conmuta entre claro y oscuro y persiste en localStorage', async ({ page }) => {
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

    // Verificar que existe el switch de tema en el header
    const toggle = page.getByRole('switch', { name: /Tema/i })
    await expect(toggle).toBeVisible()

    // Comprobar estado inicial en <html>
    const initialTheme = await page.locator('html').getAttribute('data-theme')
    expect(['light', 'dark']).toContain(initialTheme)

    // Hacer clic para cambiar de tema
    await toggle.click()
    const newTheme = initialTheme === 'light' ? 'dark' : 'light'
    await expect(page.locator('html')).toHaveAttribute('data-theme', newTheme)

    // Verificar que se guardó en localStorage
    const savedTheme = await page.evaluate(() => localStorage.getItem('theme'))
    expect(savedTheme).toBe(newTheme)

    // Recargar la página y verificar que se mantiene sin volver al inicial
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', newTheme)

    // Volver al tema inicial
    await toggle.click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', initialTheme)

    // Cero errores en consola
    expect(consoleErrors).toEqual([])
  })
})
