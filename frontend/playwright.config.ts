import { defineConfig, devices } from '@playwright/test'

/**
 * Configuración de tests E2E con Playwright para el MVP Hospitalario.
 * Cumple con los requisitos de specs §7 y AGENTS.md:
 * - Flujos F1-F7 y criterios C1-C12.
 * - Falla automáticamente ante errores de consola o excepciones de página.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5199',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev -- --port 5199 --strictPort',
    cwd: '.',
    url: 'http://localhost:5199',
    reuseExistingServer: true,
  },
})
