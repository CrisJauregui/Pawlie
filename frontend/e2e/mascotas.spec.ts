import { expect, test } from "@playwright/test";
import { DUENA, iniciarSesion } from "./helpers";

test("la dueña registra, edita y elimina una mascota", async ({ page }) => {
  // Nombre único para no chocar con datos de otras ejecuciones.
  const nombre = `Rocky ${Date.now()}`;
  page.on("dialog", (dialogo) => dialogo.accept());

  await iniciarSesion(page, DUENA);
  await page.goto("/mascotas");
  await expect(page.getByText("Max", { exact: true })).toBeVisible();

  // Registrar
  await page.getByRole("button", { name: "Nueva mascota" }).click();
  await page.getByLabel("Nombre").fill(nombre);
  await page.getByLabel("Especie").selectOption("Gato");
  await page.getByLabel("Raza (opcional)").fill("Criollo");
  await page.getByLabel("Edad en años (opcional)").fill("3");
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page.getByRole("status")).toContainText("quedó registrada");
  const tarjeta = page.getByRole("listitem").filter({ hasText: nombre });
  await expect(tarjeta).toContainText("Gato · Criollo · 3 años");

  // Editar
  await tarjeta.getByRole("button", { name: "Editar" }).click();
  await page.getByLabel("Edad en años (opcional)").fill("4");
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(tarjeta).toContainText("4 años");

  // Persistencia: al recargar sigue ahí (viene de la base de datos)
  await page.reload();
  await expect(
    page.getByRole("listitem").filter({ hasText: nombre }),
  ).toContainText("4 años");

  // Eliminar
  await page
    .getByRole("listitem")
    .filter({ hasText: nombre })
    .getByRole("button", { name: "Eliminar" })
    .click();
  await expect(page.getByRole("status")).toContainText("fue eliminada");
  await expect(
    page.getByRole("listitem").filter({ hasText: nombre }),
  ).toHaveCount(0);
});

test("pide el nombre antes de enviar", async ({ page }) => {
  await iniciarSesion(page, DUENA);
  await page.goto("/mascotas");
  await page.getByRole("button", { name: "Nueva mascota" }).click();
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Escribe el nombre" }),
  ).toBeVisible();
});
