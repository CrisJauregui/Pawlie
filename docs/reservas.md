# Buscar cuidadores y reservar (F1)

Módulos del backend: `caregivers`, `services` y `requests`.
Todos los endpoints exigen sesión (`Authorization: Bearer <token>`).

## Endpoints

| Método | Ruta | Rol | Qué hace |
| --- | --- | --- | --- |
| GET | `/caregivers?city=&type=&date=` | cualquiera | Busca cuidadores. Filtros opcionales y combinables |
| GET | `/caregivers/:id` | cualquiera | Perfil con servicios activos, disponibilidad y calificación |
| POST | `/services` | CAREGIVER | Crea un servicio propio |
| GET | `/services` | CAREGIVER | Lista sus servicios |
| GET | `/services/:id` | CAREGIVER | Ve uno de sus servicios |
| PATCH | `/services/:id` | CAREGIVER | Edita un servicio (también `isActive`) |
| DELETE | `/services/:id` | CAREGIVER | Elimina un servicio (409 si ya tiene solicitudes) |
| POST | `/requests` | OWNER | Crea una reserva (queda `PENDIENTE`) |
| GET | `/requests/me?status=` | cualquiera | Solicitudes del usuario (hechas si es dueño, recibidas si es cuidador) |
| GET | `/requests/:id` | cualquiera | Detalle (solo el dueño o el cuidador de esa solicitud) |
| PATCH | `/requests/:id/accept` | CAREGIVER | `PENDIENTE` → `ACEPTADA` |
| PATCH | `/requests/:id/reject` | CAREGIVER | `PENDIENTE` → `RECHAZADA` |
| PATCH | `/requests/:id/cancel` | OWNER | `PENDIENTE` o `ACEPTADA` → `CANCELADA` |

Iniciar, actualizar y finalizar el servicio (`start`, `updates`, `complete`) está en el módulo `updates`.

### Filtros de `GET /caregivers`

- `city`: búsqueda parcial sin distinguir mayúsculas (`cali` encuentra "San Fernando, Cali").
- `type`: `PASEO`, `CUIDADO_EN_CASA` o `BANO`. Solo cuidadores con un servicio **activo** de ese tipo.
- `date`: `YYYY-MM-DD`. Solo cuidadores con disponibilidad ese día de la semana.

### Cuerpo de `POST /requests`

```json
{
  "caregiverId": "uuid",
  "serviceId": "uuid",
  "petId": "uuid",
  "startAt": "2026-10-27T15:00:00Z",
  "notes": "Max es muy sociable"
}
```

La hora de fin no se envía: se calcula con la duración del servicio.

## Reglas de negocio (`RequestsService.create`)

| Regla | Si no se cumple |
| --- | --- |
| La mascota es del dueño que reserva | 404 |
| El servicio es de ese cuidador | 400 |
| El servicio está activo | 400 |
| La fecha es futura | 400 |
| Empieza y termina el mismo día, dentro de una franja de disponibilidad del cuidador | 400 |
| No se cruza con otra reserva `PENDIENTE`, `ACEPTADA` o `EN_CURSO` del cuidador | 409 |

Al aceptar, rechazar o cancelar:

- Aceptar o rechazar solo si está `PENDIENTE` (409 si no).
- Cancelar solo si está `PENDIENTE` o `ACEPTADA` (409 si no).
- Si la solicitud no es del usuario (otro dueño u otro cuidador) responde 404, para no revelar que existe.
- El cambio de estado es un `UPDATE ... WHERE status IN (...)`: si dos peticiones llegan a la vez, solo una gana.

## Decisiones

- **Zona horaria.** Las franjas de `availability` están en hora de Colombia (UTC-5, sin horario de verano). `common/utils/local-time.ts` convierte las fechas sin depender de la zona del servidor, así que funciona igual en local y en Render o Railway (UTC).
- **Precio congelado.** `requests.total_price` copia el precio del servicio al reservar; si el cuidador lo cambia después, la reserva no se afecta.
- **Reservas simultáneas.** La validación de cruce y el guardado son dos pasos separados. Dos reservas enviadas exactamente al mismo tiempo para el mismo horario podrían pasar ambas. Para cerrarlo del todo haría falta una restricción de exclusión en Postgres o un bloqueo por cuidador dentro de una transacción.
