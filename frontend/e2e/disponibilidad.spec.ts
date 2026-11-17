import { expect, test } from "@playwright/test";
import { CUIDADORA, iniciarSesion } from "./helpers";

test.describe("Disponibilidad del cuidador", () => {
  test.beforeEach(async ({ page }) => {
    await iniciarSesion(page, CUIDADORA);
    await page.goto("/disponibilidad");
    await expect(page.getByText("Lunes", { exact: true }).last()).toBeVisible();
  });

  test("agrega y elimina un horario del domingo", async ({ page }) => {
    const domingo = page.getByRole("listitem").filter({ hasText: "Domingo" });

    await page.getByLabel("Día").selectOption({ label: "Domingo" });
    await page.getByLabel("Desde").fill("06:00");
    await page.getByLabel("Hasta").fill("07:00");
    await page.getByRole("button", { name: "Agregar" }).click();
    await expect(domingo).toContainText("06:00 – 07:00");

    await domingo
      .getByRole("button", { name: "Eliminar horario Domingo 06:00" })
      .click();
    await expect(domingo).not.toContainText("06:00 – 07:00");
  });

  test("el backend rechaza un horario que se cruza", async ({ page }) => {
    // Los datos demo ya tienen lunes 08:00–12:00.
    await page.getByLabel("Día").selectOption({ label: "Lunes" });
    await page.getByLabel("Desde").fill("09:00");
    await page.getByLabel("Hasta").fill("10:00");
    await page.getByRole("button", { name: "Agregar" }).click();
    await expect(
      page.getByRole("alert").filter({ hasText: "se cruza" }),
    ).toBeVisible();
  });
});
