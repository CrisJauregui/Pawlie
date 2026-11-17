import { expect, type Page } from "@playwright/test";

// Usuarios creados por `npm run seed` en el backend.
export const DUENA = { email: "maria@pawlie.com", inicio: "/dueno" };
export const CUIDADORA = { email: "camila@pawlie.com", inicio: "/cuidador" };
export const CONTRASENA_DEMO = "Pawlie123";

// Inicia sesión desde la pantalla de login, como lo haría un usuario.
export async function iniciarSesion(
  page: Page,
  usuario: { email: string; inicio: string },
) {
  await page.goto("/login");
  await page.getByPlaceholder("hola@ejemplo.com").fill(usuario.email);
  await page.getByPlaceholder("Tu contraseña").fill(CONTRASENA_DEMO);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page).toHaveURL(new RegExp(`${usuario.inicio}$`));
}
