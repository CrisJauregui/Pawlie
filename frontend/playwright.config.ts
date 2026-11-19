import { defineConfig, devices } from "@playwright/test";

// Pruebas E2E del frontend (flujos críticos de punta a punta).
// Necesitan el backend corriendo con los datos demo (npm run seed) y el
// frontend en E2E_BASE_URL (por defecto http://localhost:3001).
// Si el frontend no está corriendo, Playwright lo levanta con `npm run dev`.
const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3001";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        // En CI el backend ya ocupa el 3000; el frontend va en el 3001 como en dev.
        command: process.env.CI ? "npm run start -- -p 3001" : "npm run dev",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
