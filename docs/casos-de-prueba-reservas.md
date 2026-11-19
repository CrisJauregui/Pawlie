# Casos de prueba manuales: búsqueda y reservas (F1)

Funcionalidad de Felipe. Probado en local el 19 de noviembre de 2026, con los datos demo (`npm run seed`).

Cuentas: `maria@pawlie.com` (dueña), `camila@pawlie.com` y `andres@pawlie.com` (cuidadores). Contraseña: `Pawlie123`.

Los casos que la pantalla no deja hacer (B5 a B7: la app solo ofrece horas libres y no deja elegir días pasados) se probaron llamando a la API, como en Postman.

| # | Caso | Pasos | Resultado esperado | Resultado obtenido |
|---|---|---|---|---|
| B1 | Buscar cuidadores | Como María, ir a "Buscar cuidadores" | Aparecen Andrés y Camila con barrio, servicios y precios en pesos | ✅ Pasa |
| B2 | Filtrar por servicio | Elegir "Baño" | Solo quedan los cuidadores que ofrecen ese servicio | ✅ Pasa: solo queda Camila |
| B3 | Sin resultados | Escribir "Bogotá" en ciudad o barrio | Mensaje de que no hay cuidadores (estado vacío) | ✅ Pasa: "No encontramos cuidadores con esos filtros" |
| B4 | Reserva completa | Elegir cuidador, mascota, servicio, fecha y hora, y enviar | Mensaje de reserva creada; queda PENDIENTE con el precio del servicio | ✅ Pasa: "¡Solicitud enviada!" |
| B5 | Hora fuera del horario | Por la API, pedir una hora en la que el cuidador no trabaja | Error 400 y no se crea | ✅ Pasa: 400 "El cuidador no está disponible en ese horario" |
| B6 | Horario ocupado | Por la API, reservar a la misma hora que otra reserva del cuidador | Error 409 | ✅ Pasa: 409 "El cuidador ya tiene una reserva en ese horario" |
| B7 | Fecha pasada | Por la API, enviar una fecha de ayer | Error 400 | ✅ Pasa: 400 "La fecha debe ser futura" |
| B8 | El cuidador acepta | Como Andrés, ir a "Solicitudes" y aceptar la reserva de B4 | Pasa a ACEPTADA | ✅ Pasa |
| B9 | El cuidador rechaza | Crear otra reserva y, como Andrés, rechazarla | Pasa a RECHAZADA | ✅ Pasa |
| B10 | La dueña cancela | Como María, "Cancelar solicitud" en una pendiente o aceptada | Pasa a CANCELADA | ✅ Pasa |
| B11 | Sin solicitudes | Con una cuenta nueva, abrir "Solicitudes" | Estado vacío | ✅ Pasa: "No hay solicitudes en esta sección" |
| B12 | Mis servicios del cuidador | Como Camila, crear un servicio de $15.000, editarlo y desactivarlo | Se guarda; un servicio desactivado no se puede reservar | ❌ Falla: el campo Precio no acepta 15.000 ni 35.000 (solo 1.001, 2.001…) |

## Error encontrado (B12)

En `frontend/app/(app)/mis-servicios/page.tsx`, el campo "Precio (COP)" tiene `min={1}` y `step={1000}`. El navegador solo acepta valores que sean 1 más un múltiplo de 1.000, así que no deja guardar precios normales como 15.000, ni editar los servicios que ya existen.

Arreglo: cambiar `min={1}` por `min={1000}`. Con ese cambio se probó que el servicio se crea, se edita y se desactiva, y que reservar un servicio desactivado responde 400 "El servicio no está activo".
