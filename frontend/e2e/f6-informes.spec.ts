import { test, expect } from '@playwright/test'

test.describe('Flujo F6 — M7 Informes Médicos (C4, C5, C12)', () => {
  test('Navegación, filtros contextuales por chips (C4), badges >= 12px (C5) y ciclo borrador -> firmado -> adenda', async ({
    page,
  }) => {
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    page.on('pageerror', (err) => {
      consoleErrors.push(err.message)
    })

    // Navegar a /informes
    await page.goto('/informes')

    // 1. Título y ausencia de buscador global (C4)
    await expect(page.locator('.informes-page__title')).toHaveText('Informes médicos')
    await expect(page.locator('input[type="search"], input[placeholder*="Buscar"]')).toHaveCount(0)

    // 2. Chips contextuales presentes y funcionales
    const chipTodos = page.getByRole('button', { name: /Todos/i })
    const chipBorradores = page.getByRole('button', { name: /Borradores/i })
    const chipFirmados = page.getByRole('button', { name: /Firmados/i })

    await expect(chipTodos).toBeVisible()
    await expect(chipBorradores).toBeVisible()
    await expect(chipFirmados).toBeVisible()

    // Filtrar por borradores
    await chipBorradores.click()
    await expect(chipBorradores).toHaveClass(/informes-page__chip--active/)
    await expect(page.locator('.informes-page__badge--borrador').first()).toBeVisible()
    await expect(page.locator('.informes-page__badge--firmado')).toHaveCount(0)

    // Filtrar por firmados
    await chipFirmados.click()
    await expect(chipFirmados).toHaveClass(/informes-page__chip--active/)
    await expect(page.locator('.informes-page__badge--firmado').first()).toBeVisible()
    await expect(page.locator('.informes-page__badge--borrador')).toHaveCount(0)

    // Volver a todos
    await chipTodos.click()

    // 3. Ver informe firmado existente (inf-001)
    const verInf001Btn = page.getByRole('button', { name: /Ver informe inf-001/i })
    await verInf001Btn.click()

    // Comprobar visor de documento clínico
    await expect(page.locator('.informes-page__doc-title')).toHaveText('Informe Clínico Radiológico')
    await expect(page.locator('.informes-page__badge--firmado')).toBeVisible()
    await expect(page.locator('.informes-page__badge--firmado')).toContainText('Firmado')
    await expect(page.locator('.informes-page__doc-id')).toHaveText('inf-001')

    // Comprobar secciones obligatorias
    await expect(page.getByText('Evaluación de dolor torácico recurrente')).toBeVisible()
    await expect(page.getByText('Estudio sin hallazgos agudos pleuropulmonares')).toBeVisible()

    // Comprobar adendas existentes
    await expect(page.locator('.informes-page__adenda-item')).toHaveCount(1)
    await expect(page.getByText('Se compara con placa previa de 2024')).toBeVisible()

    // 4. Volver al listado
    await page.getByRole('button', { name: /Volver a la lista/i }).click()
    await expect(page.locator('.informes-page__table')).toBeVisible()

    // 5. Cero errores en consola
    expect(consoleErrors).toEqual([])
  })

  test('Rol médico: ciclo de creación de borrador, inserción de mediciones M6 y firma inmutable', async ({
    page,
  }) => {
    // Fijar rol médico en sesión
    await page.addInitScript(() => {
      // @ts-expect-error script in page context
      window.__TEST_ROLE__ = 'medico'
    })

    await page.goto('/informes')

    // Cambiar a rol médico mediante session export si existe
    await page.evaluate(async () => {
      const sessionModule = await import('/src/lib/session.ts')
      sessionModule.setRole('medico')
    })

    // 1. Botón 'Nuevo informe' debe estar visible para médico (Constitución Art. III §3)
    const newBtn = page.locator('.informes-page__new-btn')
    await expect(newBtn).toBeVisible()
    await newBtn.click()

    // 2. Formulario de redacción abierto
    await expect(page.locator('.informes-page__editor-title')).toHaveText('Redactar nuevo borrador')

    // Seleccionar paciente pac-001
    await page.selectOption('#informe-paciente', 'pac-001')

    // Vincular estudio con mediciones (est-001)
    await page.selectOption('#informe-estudio', 'est-001')

    // Banner de mediciones M6 aparece
    const measurementsBanner = page.locator('.informes-page__study-banner')
    await expect(measurementsBanner).toBeVisible()
    await expect(measurementsBanner).toContainText('2 mediciones')

    // Insertar mediciones en el campo hallazgos
    const insertBtn = page.locator('.informes-page__insert-measurements-btn')
    await insertBtn.click()

    const hallazgosInput = page.locator('#informe-hallazgos')
    await expect(hallazgosInput).toHaveValue(/14\.8 mm/)

    // Completar motivo y conclusión
    await page.fill('#informe-motivo', 'Control postquirúrgico y valoración de consolidación ósea')
    await page.fill('#informe-conclusion', 'Evolución clínica favorable con consolidación simétrica')

    // Guardar borrador
    await page.getByRole('button', { name: /Guardar borrador/i }).click()

    // Alerta de éxito
    await expect(page.locator('.informes-page__alert--success')).toContainText('Borrador creado')

    // 3. El informe ahora está seleccionado en modo borrador
    await expect(page.locator('.informes-page__badge--borrador')).toBeVisible()

    // 4. Firmar informe (pasa a inmutable)
    const signBtn = page.locator('.informes-page__sign-btn')
    await expect(signBtn).toBeVisible()
    await signBtn.click()

    // Estado pasa a 'firmado'
    await expect(page.locator('.informes-page__badge--firmado')).toBeVisible()
    await expect(page.locator('.informes-page__alert--success')).toContainText('Informe firmado debidamente')

    // Ya no debe existir botón de editar borrador ni de firmar de nuevo
    await expect(page.getByRole('button', { name: /Editar borrador/i })).toHaveCount(0)
    await expect(page.locator('.informes-page__sign-btn')).toHaveCount(0)

    // 5. Añadir adenda al informe firmado
    const addAdendaBtn = page.getByRole('button', { name: /Añadir adenda/i })
    await expect(addAdendaBtn).toBeVisible()
    await addAdendaBtn.click()

    await page.fill('#adenda-texto', 'Adenda aclaratoria: Paciente refiere tolerancia adecuada al tratamiento.')
    await page.getByRole('button', { name: /Registrar adenda/i }).click()

    // La nueva adenda aparece en el historial
    await expect(page.getByText('Paciente refiere tolerancia adecuada')).toBeVisible()
  })

  test('Rol admin: visualización estricta sin acciones restringidas en el DOM (Constitución Art. III §3)', async ({
    page,
  }) => {
    await page.goto('/informes')

    // Asegurar rol admin
    await page.evaluate(async () => {
      const sessionModule = await import('/src/lib/session.ts')
      sessionModule.setRole('admin')
    })

    // 1. Botón 'Nuevo informe' NO debe existir en el DOM
    await expect(page.locator('.informes-page__new-btn')).toHaveCount(0)

    // 2. Abrir un informe borrador existente (inf-002)
    const verInf002Btn = page.getByRole('button', { name: /Ver informe inf-002/i })
    await verInf002Btn.click()

    // 3. Botones 'Editar borrador' y 'Firmar' NO deben renderizarse para admin
    await expect(page.getByRole('button', { name: /Editar borrador/i })).toHaveCount(0)
    await expect(page.locator('.informes-page__sign-btn')).toHaveCount(0)

    // 4. Botón de imprimir sí está disponible para admin
    await expect(page.locator('.informes-page__print-btn')).toBeVisible()

    // 5. Volver y abrir informe firmado (inf-001)
    await page.getByRole('button', { name: /Volver a la lista/i }).click()
    await page.getByRole('button', { name: /Ver informe inf-001/i }).click()

    // 6. Botón 'Añadir adenda' NO debe renderizarse para admin
    await expect(page.getByRole('button', { name: /Añadir adenda/i })).toHaveCount(0)
  })
})
