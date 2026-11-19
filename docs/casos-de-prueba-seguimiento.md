# Casos de prueba manuales: autenticación, seguimiento y reseñas

Responsable: Cristina Jauregui. Probado en local el 19 de noviembre de 2026, con los datos demo (`npm run seed`).

Cuentas: `maria@pawlie.com` (dueña) y `camila@pawlie.com` (cuidadora). Contraseña: `Pawlie123`.

## Autenticación y permisos

| # | Caso | Pasos | Resultado esperado | Resultado obtenido |
|---|---|---|---|---|
| A1 | Registro de un dueño | Ir a `/registro`, llenar nombre, correo nuevo, celular y contraseña. En la pantalla de rol elegir "Soy dueño de mascota" y "Crear cuenta" | Entra a `/dueno` y ve "Todavía no tienes mascotas registradas" | ✅ Pasa |
| A2 | Correo repetido | Registrarse con `maria@pawlie.com` | Mensaje "Ya existe una cuenta con ese correo" | ✅ Pasa |
| A3 | Inicio de sesión correcto | Ir a `/login` con la cuenta de María | Entra a `/dueno` con su nombre y sus mascotas | ✅ Pasa |
| A4 | Contraseña incorrecta | Iniciar sesión con una clave equivocada | Mensaje "Correo o contraseña incorrectos", sin decir si el correo existe | ✅ Pasa |
| A5 | Ruta privada sin sesión | Sin iniciar sesión, abrir `/dueno` | Redirige a `/login` | ✅ Pasa |
| A6 | Pantalla de otro rol | Como María, abrir `/cuidador` | Vuelve a `/dueno` | ✅ Pasa |
| A7 | Cerrar sesión | Clic en "Cerrar sesión" | Vuelve a `/login` y `/dueno` ya no abre | ✅ Pasa |

## Seguimiento del servicio (F3)

| # | Caso | Pasos | Resultado esperado | Resultado obtenido |
|---|---|---|---|---|
| S1 | Dashboard del dueño | Iniciar sesión como María | Ve a Max, Luna y Nube y sus próximos servicios | ✅ Pasa |
| S2 | Lista de servicios | Ir a "Servicios" y cambiar entre Activos, Finalizados y Todos | Cada filtro muestra sus servicios; si no hay, un mensaje con enlace a buscar | ✅ Pasa |
| S3 | Servicio pendiente o aceptado | Abrir el servicio de Luna (aceptado) | Pantalla "¡Solicitud confirmada!" con los pasos del estado | ✅ Pasa |
| S4 | Seguimiento en curso | Abrir el paseo de Max en curso | Línea de tiempo con las actualizaciones de la cuidadora | ✅ Pasa |
| S5 | Se actualiza solo | Dejar abierta la pantalla de un servicio activo | Cada 15 segundos consulta de nuevo el backend (se ve en F12 → Network → `tracking`) | ✅ Pasa |
| S6 | Servicio de otra persona | Abrir `/servicios/<id que no es suyo>` | Mensaje "Solicitud no encontrada" (el backend responde 404) | ✅ Pasa |
| S7 | Servidor que no responde | Con el backend detenido o muy lento, abrir "Servicios" | Tras 10 segundos: "El servidor tardó demasiado en responder. Intenta de nuevo." | ✅ Pasa |

## Reseñas (F3)

| # | Caso | Pasos | Resultado esperado | Resultado obtenido |
|---|---|---|---|---|
| R1 | Calificar un servicio finalizado | Abrir el paseo finalizado de Max, elegir 5 estrellas y "Enviar reseña" | Mensaje "Tu reseña quedó guardada" y se muestra la calificación | ✅ Pasa |
| R2 | Reseña ya enviada | Abrir el servicio de Nube | Se ve la reseña con sus estrellas, comentario y etiquetas, sin formulario | ✅ Pasa |
| R3 | Calificar dos veces | Enviar otra reseña a la misma solicitud (Postman) | 409 "Ya calificaste este servicio" | ✅ Pasa (también en `test/seguimiento.e2e-spec.ts`) |
| R4 | Calificar un servicio no terminado | Enviar una reseña a una solicitud en curso (Postman) | 409 "Solo puedes calificar un servicio finalizado" | ✅ Pasa (también en `test/seguimiento.e2e-spec.ts`) |
