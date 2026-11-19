# Casos de prueba manuales: mascotas, calendario y servicio del cuidador (F2)

Funcionalidad de Ospina. Probado en local el 19 de noviembre de 2026, con los datos demo (`npm run seed`).

Cuentas: `maria@pawlie.com` (dueña), `camila@pawlie.com` y `andres@pawlie.com` (cuidadores). Contraseña: `Pawlie123`.

M2 a M4 y C1 a C3 también están cubiertos por las pruebas E2E de Playwright (`frontend/e2e/mascotas.spec.ts` y `frontend/e2e/disponibilidad.spec.ts`), que corren en el CI.

## Mis mascotas

| # | Caso | Pasos | Resultado esperado | Resultado obtenido |
|---|---|---|---|---|
| M1 | Ver mis mascotas | Como María, ir a "Mis mascotas" | Aparecen Max, Luna y Nube | ✅ Pasa |
| M2 | Registrar una mascota | Llenar el formulario y guardar | Aparece en la lista | ✅ Pasa (también en E2E) |
| M3 | Nombre vacío | Guardar sin nombre | Pide el nombre antes de enviar | ✅ Pasa (también en E2E) |
| M4 | Editar y eliminar | Cambiar un dato de la mascota nueva y luego eliminarla | Se guarda el cambio y después desaparece | ✅ Pasa (también en E2E) |
| M5 | Sin mascotas | Con una cuenta nueva, abrir "Mis mascotas" | Estado vacío | ✅ Pasa: "Todavía no has registrado mascotas" |

## Calendario (disponibilidad)

| # | Caso | Pasos | Resultado esperado | Resultado obtenido |
|---|---|---|---|---|
| C1 | Agregar un horario | Como Camila, ir a "Calendario" y agregar un horario | Aparece en su disponibilidad | ✅ Pasa (también en E2E) |
| C2 | Horario que se cruza | Agregar un horario que se cruza con otro | Mensaje de error del backend | ✅ Pasa (también en E2E) |
| C3 | Eliminar un horario | Eliminar el horario de C1 | Desaparece de la lista | ✅ Pasa (también en E2E) |

## Dashboard y servicio del cuidador

| # | Caso | Pasos | Resultado esperado | Resultado obtenido |
|---|---|---|---|---|
| D1 | Dashboard del cuidador | Como Andrés, abrir su inicio | Ve sus solicitudes reales y los contadores | ✅ Pasa: sin datos de prueba |
| D2 | Iniciar un servicio | "Iniciar servicio" en una solicitud ACEPTADA | Pasa a EN_CURSO | ✅ Pasa |
| D3 | Publicar una actualización | Escribir "Llegamos al parque" y "Publicar" | La dueña lo ve en su línea de tiempo | ✅ Pasa |
| D4 | Finalizar el servicio | "Finalizar servicio" | Pasa a FINALIZADA y la dueña puede calificar | ✅ Pasa: a María le aparece "¿Cómo fue tu experiencia?" |
| D5 | Permisos | Como María, abrir `/disponibilidad` | Vuelve a `/dueno` | ✅ Pasa |
