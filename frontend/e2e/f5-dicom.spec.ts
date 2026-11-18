import { test, expect } from '@playwright/test'

test.describe('Flujo F5 — Visor DICOM y Mediciones (C12, M6)', () => {
  test('Carga de estudio calibrado, W/L, mediciones y conmutación a sin calibrar', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    page.on('pageerror', (err) => {
      consoleErrors.push(err.message)
    })

    // Navegar directamente a /estudios
    await page.goto('/estudios')

    // 1. Título y cabecera presentes
    await expect(page.locator('h1.dicom-page__title')).toHaveText('Visor DICOM')

    // 2. Esperar a que la muestra calibrada cargue y el badge muestre 'Calibrado'
    const calibratedBadge = page.locator('.dicom-page__hud-badge--calibrated')
    await expect(calibratedBadge).toBeVisible()
    await expect(calibratedBadge).toContainText('Calibrado: 0.15 mm/px')

    // 3. Probar presets de Ventana / Nivel (W/L)
    const pulmonBtn = page.getByRole('button', { name: 'Pulmón' })
    await expect(pulmonBtn).toBeVisible()
    await pulmonBtn.click()

    // El HUD inferior izquierdo debe reflejar el nuevo W/L
    const hudBl = page.locator('.dicom-page__hud--bl')
    await expect(hudBl).toContainText('W: 1500')
    await expect(hudBl).toContainText('L: -600')

    const huesoBtn = page.getByRole('button', { name: 'Hueso' })
    await huesoBtn.click()
    await expect(hudBl).toContainText('W: 2000')
    await expect(hudBl).toContainText('L: 400')

    // 4. Seleccionar herramienta de Distancia (Regla)
    const distanceToolBtn = page.locator('.dicom-page__tool-btn', { hasText: 'Distancia' })
    await distanceToolBtn.click()
    await expect(distanceToolBtn).toHaveClass(/dicom-page__tool-btn--active/)

    // 5. Simular medición haciendo dos clics en el canvas del viewport
    const viewport = page.locator('.dicom-page__viewport-canvas-wrapper')
    await viewport.click({ position: { x: 100, y: 100 } })
    await viewport.click({ position: { x: 200, y: 100 } })

    // Debe aparecer una medición en la lista
    const measurementItem = page.locator('.dicom-page__measurement-item').first()
    await expect(measurementItem).toBeVisible()
    // Como está calibrada a 0.15 mm/px, ~100px * 0.15 = ~15 mm
    await expect(measurementItem).toContainText('mm')
    await expect(measurementItem).toContainText('DISTANCIA')

    // 6. Conmutar a muestra sin calibración
    const uncalibratedBtn = page.getByRole('button', { name: 'Muestra sin calibración' })
    await uncalibratedBtn.click()

    const uncalibratedBadge = page.locator('.dicom-page__hud-badge--uncalibrated')
    await expect(uncalibratedBadge).toBeVisible()
    await expect(uncalibratedBadge).toContainText('Sin calibración (px)')

    // 7. Medir sobre muestra sin calibración
    await distanceToolBtn.click()
    await viewport.click({ position: { x: 120, y: 120 } })
    await viewport.click({ position: { x: 180, y: 120 } })

    const lastMeasurement = page.locator('.dicom-page__measurement-item').last()
    await expect(lastMeasurement).toContainText('px')
    await expect(lastMeasurement).toContainText('SIN CALIBRACIÓN')

    // 8. Cero errores de consola
    expect(consoleErrors).toEqual([])
  })
})
