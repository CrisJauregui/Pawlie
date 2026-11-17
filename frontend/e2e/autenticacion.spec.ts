import { expect, test } from "@playwright/test";
import { CUIDADORA, DUENA, iniciarSesion } from "./helpers";

test.describe("Autenticación y autorización", () => {
  test("sin sesión, una ruta privada redirige al login", async ({ page }) => {
    await page.goto("/mascotas");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("con contraseña incorrecta muestra el error del backend", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByPlaceholder("hola@ejemplo.com").fill(DUENA.email);
    await page.getByPlaceholder("Tu contraseña").fill("ContrasenaMala1");
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    await expect(
      page.getByRole("alert").filter({ hasText: /\S/ }),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("la dueña entra a su inicio y ve su menú", async ({ page }) => {
    await iniciarSesion(page, DUENA);
    const menu = page.getByRole("navigation").first();
    await expect(menu.getByRole("link", { name: "Mis mascotas" })).toBeVisible();
    await expect(menu.getByRole("link", { name: "Calendario" })).toHaveCount(0);
  });

  test("la dueña no puede abrir pantallas del cuidador", async ({ page }) => {
    await iniciarSesion(page, DUENA);
    await page.goto("/disponibilidad");
    await expect(page).toHaveURL(/\/dueno$/);
  });

  test("la cuidadora no puede abrir pantallas del dueño", async ({ page }) => {
    await iniciarSesion(page, CUIDADORA);
    await page.goto("/mascotas");
    await expect(page).toHaveURL(/\/cuidador$/);
  });

  test("cerrar sesión vuelve al login", async ({ page }) => {
    await iniciarSesion(page, DUENA);
    await page.getByRole("button", { name: "Cerrar sesión" }).first().click();
    await expect(page).toHaveURL(/\/login$/);
    await page.goto("/dueno");
    await expect(page).toHaveURL(/\/login$/);
  });
});
